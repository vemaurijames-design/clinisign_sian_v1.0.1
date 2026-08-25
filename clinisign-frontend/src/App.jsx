import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PacienteDetalle from "./pages/PacienteDetalle";
import HistoriaClinicaForm from "./pages/HistoriaClinicaForm";
import ConsentimientoForm from "./pages/ConsentimientoForm";
import DesistimientoForm from "./pages/DesistimientoForm";
import Solicitudes from "./pages/Solicitudes";
import Usuarios from "./pages/Usuarios";

function PrivateRoute({ children, requireAdmin = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/:id" element={<PacienteDetalle />} />
          <Route path="historias-clinicas/nueva" element={<HistoriaClinicaForm />} />
          <Route path="historias-clinicas/:id/editar" element={<HistoriaClinicaForm />} />
          <Route path="consentimientos/nuevo" element={<ConsentimientoForm />} />
          <Route path="desistimientos/nuevo" element={<DesistimientoForm />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route
            path="usuarios"
            element={
              <PrivateRoute requireAdmin>
                <Usuarios />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
