import { useMemo } from "react";
import { TrendingUp, Users, Star, ShoppingBag } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useVentas } from "../hooks/useVentas";
import { useClientes } from "../hooks/useClientes";

function esHoy(timestamp) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const hoy = new Date();
  return (
    d.getDate() === hoy.getDate() &&
    d.getMonth() === hoy.getMonth() &&
    d.getFullYear() === hoy.getFullYear()
  );
}

function esEsteMes(timestamp) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const hoy = new Date();
  return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
}

export default function Dashboard() {
  const { ventas, loading: loadingVentas } = useVentas();
  const { clientes, loading: loadingClientes } = useClientes();

  const loading = loadingVentas || loadingClientes;

  const ventasHoy = useMemo(() => ventas.filter((v) => esHoy(v.creadoEn)), [ventas]);
  const ventasMes = useMemo(() => ventas.filter((v) => esEsteMes(v.creadoEn)), [ventas]);

  const totalHoy = ventasHoy.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const totalMes = ventasMes.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const clientesVip = clientes.filter((c) => c.vip).length;

  const actividadReciente = useMemo(
    () =>
      [...ventas]
        .filter((v) => v.creadoEn)
        .sort((a, b) => b.creadoEn - a.creadoEn)
        .slice(0, 6),
    [ventas]
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Ventas de hoy" value={`$${totalHoy.toLocaleString("es-AR")}`} />
          <StatCard icon={TrendingUp} label="Ventas del mes" value={`$${totalMes.toLocaleString("es-AR")}`} />
          <StatCard icon={Users} label="Clientes totales" value={clientes.length} />
          <StatCard icon={Star} label="Clientes VIP" value={clientesVip} />
        </div>

        <Card>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <ShoppingBag size={15} /> Actividad reciente
          </p>
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-ink-500">Todavía no hay ventas registradas.</p>
          ) : (
            <div className="flex flex-col divide-y divide-ink-300/20">
              {actividadReciente.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink-900">{v.clienteNombre}</p>
                    <p className="text-xs text-ink-500">
                      {v.items?.length || 0} item{v.items?.length !== 1 && "s"} ·{" "}
                      {new Date(v.creadoEn).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <span className="font-semibold text-ink-900">
                    ${Number(v.total).toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
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
