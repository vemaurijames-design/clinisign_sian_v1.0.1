# CliniSign - SIAN SALUD Ambulancias
## Plataforma de Gestión Clínica Prehospitalaria

**Empresa:** AMBULANCIAS SIAN SALUD S.A.S.  
**NIT:** 901806509-5  
**Dirección:** CR 71 17 03, Medellín, Antioquia  
**Email:** siansaludmedellin@gmail.com  
**Tel:** 3113172171 - 3008881782

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Spring Boot 3.2 + Maven |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT (Spring Security) |
| Contenedores | Docker + Docker Compose |
| Producción | AWS (CloudFront + S3 + ECS + RDS) |

---

## Requisitos previos

Instala estas herramientas antes de continuar:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- [Java 17+](https://adoptium.net/) (solo si quieres correr el backend sin Docker)
- [Node.js 18+](https://nodejs.org/) (solo si quieres correr el frontend sin Docker)
- [Maven 3.8+](https://maven.apache.org/download.cgi) (solo si quieres compilar sin Docker)

---

## Clonar el repositorio

```bash
git clone https://github.com/vemaurijames-design/clinisign_sian_v1.0.git
cd clinisign_sian_v1.0
```

---

## Opción 1: Levantar con Docker Compose (RECOMENDADO)

Este método levanta todo automáticamente: PostgreSQL + Backend + Frontend.

```bash
# 1. Clonar
git clone https://github.com/vemaurijames-design/clinisign_sian_v1.0.git
cd clinisign_sian_v1.0

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker-compose up --build

# 4. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Detener los servicios

```bash
docker-compose down

# Para eliminar también los volúmenes (base de datos):
docker-compose down -v
```

---

## Opción 2: Correr localmente sin Docker

### 2.1 Base de datos PostgreSQL

```bash
# Instala PostgreSQL 15 o usa Docker solo para la BD:
docker run -d \
  --name clinisign_db \
  -e POSTGRES_DB=clinisign_db \
  -e POSTGRES_USER=clinisign_user \
  -e POSTGRES_PASSWORD=clinisign_pass \
  -p 5432:5432 \
  postgres:15-alpine

# Ejecutar el script de inicialización:
psql -h localhost -U clinisign_user -d clinisign_db -f database/init.sql
```

### 2.2 Backend Spring Boot

```bash
cd clinisign-backend

# Copiar configuración
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml

# Compilar y correr
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# El backend quedará en: http://localhost:8080
```

### 2.3 Frontend React

```bash
cd clinisign-frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Correr en desarrollo
npm run dev

# El frontend quedará en: http://localhost:5173
```

---

## Credenciales por defecto

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Admin | admin@siansalud.com | Admin2024* | ADMIN |
| Coordinador | coordinador@siansalud.com | Coord2024* | COORDINADOR |
| Auxiliar | auxiliar@siansalud.com | Aux2024* | AUXILIAR_APH |

> **IMPORTANTE:** Cambia estas contraseñas inmediatamente en producción.

---

## Estructura del proyecto

```
clinisign_sian_v1.0/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml              # Desarrollo local
├── docker-compose.prod.yml         # Producción AWS
├── database/
│   └── init.sql                    # Script BD completo
├── clinisign-backend/              # Spring Boot API
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/clinisign/
│           │   ├── CliniSignApplication.java
│           │   ├── config/          # Security, CORS, JWT
│           │   ├── controller/      # REST Controllers
│           │   ├── model/           # Entidades JPA
│           │   ├── repository/      # Spring Data JPA
│           │   ├── service/         # Lógica de negocio
│           │   ├── dto/             # Data Transfer Objects
│           │   └── security/        # JWT Filter & Utils
│           └── resources/
│               └── application.yml
└── clinisign-frontend/             # React App
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── api/                    # Axios clients
        ├── components/             # Componentes reutilizables
        ├── pages/                  # Páginas de la app
        ├── context/                # Auth Context
        └── utils/                  # Helpers, Excel, etc.
```

---

## Módulos del sistema

| Módulo | Descripción | Roles |
|--------|-------------|-------|
| **Login** | Autenticación JWT | Todos |
| **Dashboard** | Panel principal con estadísticas | Todos |
| **Pacientes** | CRUD completo + import/export Excel | ADMIN, COORDINADOR |
| **Historia Clínica** | Formulario HC-FM-05 completo | Todos |
| **Consentimiento Informado** | Formulario HC-FM-04 + firma digital + huella | Todos |
| **Desistimiento Informado** | Formulario HC-FM-06 + firma digital + huella | Todos |
| **Solicitudes** | Gestión de solicitudes de traslado | Todos |
| **Usuarios** | CRUD de usuarios y roles | Solo ADMIN |
| **Reportes** | Export a Excel/PDF | ADMIN, COORDINADOR |

---

## API Endpoints principales

```
POST   /api/auth/login              - Iniciar sesión
POST   /api/auth/refresh            - Renovar token

GET    /api/pacientes               - Listar pacientes
POST   /api/pacientes               - Crear paciente
PUT    /api/pacientes/{id}          - Actualizar paciente
DELETE /api/pacientes/{id}          - Eliminar paciente
POST   /api/pacientes/import-excel  - Importar desde Excel
GET    /api/pacientes/export-excel  - Exportar a Excel

GET    /api/historias-clinicas      - Listar historias
POST   /api/historias-clinicas      - Crear historia clínica

POST   /api/consentimientos         - Crear consentimiento informado
POST   /api/desistimientos          - Crear desistimiento informado

GET    /api/solicitudes             - Listar solicitudes
POST   /api/solicitudes             - Crear solicitud

GET    /api/usuarios                - Listar usuarios (ADMIN)
POST   /api/usuarios                - Crear usuario (ADMIN)
```

---

## Arquitectura de Producción (AWS)

```
Internet → HTTPS → CloudFront (CDN)
                        ↓
                   S3 (React build)   →   ECS (Spring Boot Docker)
                                                    ↓
                                             RDS PostgreSQL
```

### Pasos para producción

1. Construir imagen Docker del backend:
```bash
cd clinisign-backend
docker build -t clinisign-backend:latest .
# Push a ECR (AWS Container Registry)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag clinisign-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/clinisign-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/clinisign-backend:latest
```

2. Build del frontend para S3:
```bash
cd clinisign-frontend
npm run build
aws s3 sync dist/ s3://clinisign-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

3. Usar `docker-compose.prod.yml` como referencia para la configuración de ECS.

---

## Variables de entorno

Ver `.env.example` para todas las variables necesarias.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_HOST | Host PostgreSQL | localhost |
| DB_PORT | Puerto PostgreSQL | 5432 |
| DB_NAME | Nombre de la BD | clinisign_db |
| DB_USER | Usuario BD | clinisign_user |
| DB_PASSWORD | Contraseña BD | clinisign_pass |
| JWT_SECRET | Clave secreta JWT (mínimo 32 chars) | ... |
| JWT_EXPIRATION | Duración token en ms | 86400000 |
| CORS_ORIGINS | Origenes permitidos | http://localhost:3000 |

---

## Soporte

- Email: siansaludmedellin@gmail.com
- Tel: 3113172171

---

*CliniSign © 2024 - AMBULANCIAS SIAN SALUD S.A.S. - Medellín, Colombia*
