import { useState, useEffect } from "react";
import api from "../api/axios";
import { Users, FileText, ClipboardList, Activity, TrendingUp, Ambulance } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"];

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? "—"}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: "Pendientes",   value: Number(stats.solicitudesPendientes)  },
    { name: "En proceso",   value: Number(stats.solicitudesEnProceso)   },
    { name: "Completadas",  value: Number(stats.solicitudesCompletadas) },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sian-500 rounded-xl flex items-center justify-center">
          <Ambulance className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">AMBULANCIAS SIAN SALUD S.A.S.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Pacientes"
              value={stats?.totalPacientes}
              icon={Users}
              color="bg-sian-500"
              subtitle="Activos en el sistema"
            />
            <StatCard
              title="Historias Clínicas"
              value={stats?.totalHistorias}
              icon={FileText}
              color="bg-blue-500"
              subtitle="HC-FM-05 registradas"
            />
            <StatCard
              title="Solicitudes Hoy"
              value={stats?.solicitudesHoy}
              icon={Activity}
              color="bg-orange-500"
              subtitle="Creadas en el día"
            />
            <StatCard
              title="En Proceso"
              value={stats?.solicitudesEnProceso}
              icon={TrendingUp}
              color="bg-purple-500"
              subtitle="Traslados activos"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solicitudes por estado */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Estado de Solicitudes</h3>
              {pieData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  No hay solicitudes registradas
                </div>
              )}
            </div>

            {/* Resumen general */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Resumen General</h3>
              <div className="space-y-4">
                {[
                  { label: "Usuarios activos",      value: stats?.totalUsuarios,         max: 20, color: "bg-sian-500" },
                  { label: "Consentimientos",        value: stats?.totalConsentimientos,  max: 100, color: "bg-blue-500" },
                  { label: "Sol. Pendientes",        value: stats?.solicitudesPendientes, max: 50,  color: "bg-yellow-500" },
                  { label: "Sol. Completadas",       value: stats?.solicitudesCompletadas,max: 200, color: "bg-green-500" },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-800">{value ?? 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${Math.min(((value ?? 0) / max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info empresa */}
          <div className="card bg-gradient-to-r from-sian-500 to-sian-600 text-white">
            <div className="flex items-center gap-3">
              <Ambulance className="w-8 h-8 text-sian-100" />
              <div>
                <h3 className="font-bold text-lg">AMBULANCIAS SIAN SALUD S.A.S.</h3>
                <p className="text-sian-100 text-sm">NIT: 901806509-5 · CR 71 17 03, Medellín · Tel: 3113172171</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
