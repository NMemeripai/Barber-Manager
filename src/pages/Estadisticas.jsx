import { useMemo } from "react";
import { TrendingUp, Users, CreditCard, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useVentas } from "../hooks/useVentas";
import { useClientes } from "../hooks/useClientes";

const COLORES = ["#2563eb", "#60a5fa", "#93c5fd", "#1e40af"];
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default function Estadisticas() {
  const { ventas, loading: loadingVentas } = useVentas();
  const { clientes, loading: loadingClientes } = useClientes();

  const loading = loadingVentas || loadingClientes;

  const facturacionPorMes = useMemo(() => {
    const acumulado = Array(12).fill(0);
    for (const v of ventas) {
      if (!v.creadoEn) continue;
      const mes = new Date(v.creadoEn).getMonth();
      acumulado[mes] += Number(v.total) || 0;
    }
    return MESES.map((mes, i) => ({ mes, total: acumulado[i] }));
  }, [ventas]);

  const horasPico = useMemo(() => {
    const conteo = {};
    for (const v of ventas) {
      if (!v.creadoEn) continue;
      const hora = new Date(v.creadoEn).getHours();
      const key = `${hora}:00`;
      conteo[key] = (conteo[key] || 0) + 1;
    }
    return Object.entries(conteo)
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [ventas]);

  const metodosPago = useMemo(() => {
    const conteo = {};
    for (const v of ventas) {
      const m = v.metodoPago || "otro";
      conteo[m] = (conteo[m] || 0) + 1;
    }
    return Object.entries(conteo).map(([name, value]) => ({ name, value }));
  }, [ventas]);

  const clientesNuevosVsRecurrentes = useMemo(() => {
    const nuevos = clientes.filter((c) => (c.visitas || 0) <= 1).length;
    const recurrentes = clientes.filter((c) => (c.visitas || 0) > 1).length;
    return [
      { name: "Nuevos", value: nuevos },
      { name: "Recurrentes", value: recurrentes },
    ];
  }, [clientes]);

  const totalFacturado = useMemo(
    () => ventas.reduce((acc, v) => acc + (Number(v.total) || 0), 0),
    [ventas]
  );

  if (loading) {
    return (
      <DashboardLayout title="Estadísticas">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Estadísticas">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={TrendingUp} label="Facturación total" value={`$${totalFacturado.toLocaleString("es-AR")}`} />
          <StatCard icon={Users} label="Clientes totales" value={clientes.length} />
          <StatCard icon={CreditCard} label="Ventas totales" value={ventas.length} />
        </div>

        <Card>
          <p className="mb-4 text-sm font-semibold text-ink-900">Facturación por mes</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={facturacionPorMes}>
              <XAxis dataKey="mes" fontSize={12} stroke="#64748b" />
              <YAxis fontSize={12} stroke="#64748b" />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString("es-AR")}`} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Clock size={15} /> Horas pico
            </p>
            {horasPico.length === 0 ? (
              <p className="text-sm text-ink-500">Todavía no hay ventas suficientes.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={horasPico}>
                  <XAxis dataKey="hora" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <p className="mb-4 text-sm font-semibold text-ink-900">Métodos de pago</p>
            {metodosPago.length === 0 ? (
              <p className="text-sm text-ink-500">Todavía no hay ventas registradas.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={metodosPago} dataKey="value" nameKey="name" outerRadius={80} label>
                    {metodosPago.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card>
          <p className="mb-4 text-sm font-semibold text-ink-900">Clientes nuevos vs. recurrentes</p>
          {clientes.length === 0 ? (
            <p className="text-sm text-ink-500">Todavía no hay clientes cargados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={clientesNuevosVsRecurrentes} dataKey="value" nameKey="name" outerRadius={70} label>
                  {clientesNuevosVsRecurrentes.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-lg font-semibold text-ink-900">{value}</p>
      </div>
    </Card>
  );
}
