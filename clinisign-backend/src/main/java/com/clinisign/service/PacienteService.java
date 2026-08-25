package com.clinisign.service;

import com.clinisign.dto.paciente.PacienteDTO;
import com.clinisign.dto.paciente.PacienteRequest;
import com.clinisign.model.Paciente;
import com.clinisign.model.Usuario;
import com.clinisign.repository.PacienteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository repo;

    public Page<PacienteDTO> listar(String q, Pageable pageable) {
        Page<Paciente> page = (q != null && !q.isBlank())
            ? repo.buscar(q, pageable)
            : repo.findAllByActivoTrue(pageable);
        return page.map(this::toDTO);
    }

    public PacienteDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    public PacienteDTO crear(PacienteRequest req) {
        Usuario currentUser = getCurrentUser();
        Paciente p = fromRequest(req);
        p.setCreatedBy(currentUser);
        return toDTO(repo.save(p));
    }

    public PacienteDTO actualizar(Long id, PacienteRequest req) {
        Paciente p = findOrThrow(id);
        applyRequest(p, req);
        return toDTO(repo.save(p));
    }

    public void eliminar(Long id) {
        Paciente p = findOrThrow(id);
        p.setActivo(false);
        repo.save(p);
    }

    // ── Excel Export ────────────────────────────────────────

    public byte[] exportarExcel() throws IOException {
        List<Paciente> pacientes = repo.findAllByActivoTrue();

        try (Workbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Pacientes");
            String[] headers = {
                "ID", "Tipo ID", "Número ID", "Nombres", "Apellidos",
                "Fecha Nac.", "Edad", "Género", "Estado Civil",
                "Municipio", "Celular", "Teléfono", "Ocupación",
                "Aseguramiento", "EPS"
            };

            // Estilo encabezado
            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            int rowNum = 1;
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (Paciente p : pacientes) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getTipoIdentificacion());
                row.createCell(2).setCellValue(p.getNumeroIdentificacion());
                row.createCell(3).setCellValue(p.getNombres());
                row.createCell(4).setCellValue(p.getApellidos());
                row.createCell(5).setCellValue(p.getFechaNacimiento() != null ? p.getFechaNacimiento().format(fmt) : "");
                row.createCell(6).setCellValue(p.getEdad() != null ? p.getEdad() : 0);
                row.createCell(7).setCellValue(p.getGenero() != null ? p.getGenero() : "");
                row.createCell(8).setCellValue(p.getEstadoCivil() != null ? p.getEstadoCivil() : "");
                row.createCell(9).setCellValue(p.getMunicipio() != null ? p.getMunicipio() : "");
                row.createCell(10).setCellValue(p.getCelular() != null ? p.getCelular() : "");
                row.createCell(11).setCellValue(p.getTelefono() != null ? p.getTelefono() : "");
                row.createCell(12).setCellValue(p.getOcupacion() != null ? p.getOcupacion() : "");
                row.createCell(13).setCellValue(getAseguramiento(p));
                row.createCell(14).setCellValue(p.getNombreEps() != null ? p.getNombreEps() : "");
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            wb.write(out);
            return out.toByteArray();
        }
    }

    // ── Excel Import ────────────────────────────────────────

    public List<PacienteDTO> importarExcel(MultipartFile file) throws IOException {
        List<PacienteDTO> importados = new ArrayList<>();
        Usuario currentUser = getCurrentUser();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // saltar encabezado

            while (rows.hasNext()) {
                Row row = rows.next();
                if (row.getCell(2) == null || getCellValue(row.getCell(2)).isBlank()) continue;

                String numeroId = getCellValue(row.getCell(2));
                if (repo.existsByNumeroIdentificacion(numeroId)) continue;

                Paciente p = Paciente.builder()
                    .tipoIdentificacion(getCellValue(row.getCell(1), "CC"))
                    .numeroIdentificacion(numeroId)
                    .nombres(getCellValue(row.getCell(3)))
                    .apellidos(getCellValue(row.getCell(4)))
                    .municipio(getCellValue(row.getCell(9)))
                    .celular(getCellValue(row.getCell(10)))
                    .telefono(getCellValue(row.getCell(11)))
                    .ocupacion(getCellValue(row.getCell(12)))
                    .nombreEps(getCellValue(row.getCell(14)))
                    .createdBy(currentUser)
                    .build();

                importados.add(toDTO(repo.save(p)));
            }
        }
        return importados;
    }

    // ── Helpers ─────────────────────────────────────────────

    private Paciente findOrThrow(Long id) {
        return repo.findById(id)
            .filter(Paciente::getActivo)
            .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + id));
    }

    private Paciente fromRequest(PacienteRequest req) {
        Paciente p = new Paciente();
        applyRequest(p, req);
        return p;
    }

    private void applyRequest(Paciente p, PacienteRequest req) {
        p.setTipoIdentificacion(req.getTipoIdentificacion());
        p.setNumeroIdentificacion(req.getNumeroIdentificacion());
        p.setNombres(req.getNombres());
        p.setApellidos(req.getApellidos());
        p.setFechaNacimiento(req.getFechaNacimiento());
        p.setEdad(req.getEdad());
        p.setGenero(req.getGenero());
        p.setEstadoCivil(req.getEstadoCivil());
        p.setDireccion(req.getDireccion());
        p.setMunicipio(req.getMunicipio());
        p.setTelefono(req.getTelefono());
        p.setCelular(req.getCelular());
        p.setOcupacion(req.getOcupacion());
        p.setAsegSisben(req.isAsegSisben());
        p.setAsegSoat(req.isAsegSoat());
        p.setAsegEps(req.isAsegEps());
        p.setAsegParticular(req.isAsegParticular());
        p.setAsegArl(req.isAsegArl());
        p.setAsegFosyga(req.isAsegFosyga());
        p.setAsegPrepagada(req.isAsegPrepagada());
        p.setAsegNinguno(req.isAsegNinguno());
        p.setNombreEps(req.getNombreEps());
    }

    public PacienteDTO toDTO(Paciente p) {
        return PacienteDTO.builder()
            .id(p.getId())
            .tipoIdentificacion(p.getTipoIdentificacion())
            .numeroIdentificacion(p.getNumeroIdentificacion())
            .nombres(p.getNombres())
            .apellidos(p.getApellidos())
            .nombreCompleto(p.getNombres() + " " + p.getApellidos())
            .fechaNacimiento(p.getFechaNacimiento())
            .edad(p.getEdad())
            .genero(p.getGenero())
            .estadoCivil(p.getEstadoCivil())
            .direccion(p.getDireccion())
            .municipio(p.getMunicipio())
            .telefono(p.getTelefono())
            .celular(p.getCelular())
            .ocupacion(p.getOcupacion())
            .asegSisben(p.getAsegSisben())
            .asegSoat(p.getAsegSoat())
            .asegEps(p.getAsegEps())
            .asegParticular(p.getAsegParticular())
            .asegArl(p.getAsegArl())
            .asegFosyga(p.getAsegFosyga())
            .asegPrepagada(p.getAsegPrepagada())
            .asegNinguno(p.getAsegNinguno())
            .nombreEps(p.getNombreEps())
            .activo(p.getActivo())
            .createdAt(p.getCreatedAt())
            .build();
    }

    private String getAseguramiento(Paciente p) {
        if (Boolean.TRUE.equals(p.getAsegEps()))       return "EPS";
        if (Boolean.TRUE.equals(p.getAsegSisben()))    return "SISBEN";
        if (Boolean.TRUE.equals(p.getAsegSoat()))      return "SOAT";
        if (Boolean.TRUE.equals(p.getAsegArl()))       return "ARL";
        if (Boolean.TRUE.equals(p.getAsegFosyga()))    return "FOSYGA";
        if (Boolean.TRUE.equals(p.getAsegPrepagada())) return "PREPAGADA";
        if (Boolean.TRUE.equals(p.getAsegParticular())) return "PARTICULAR";
        return "NINGUNO";
    }

    private String getCellValue(Cell cell) {
        return getCellValue(cell, "");
    }

    private String getCellValue(Cell cell, String defaultVal) {
        if (cell == null) return defaultVal;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> defaultVal;
        };
    }

    private Usuario getCurrentUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
