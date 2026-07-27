import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <Card>
        <p className="text-sm text-ink-700">
          Este es un dashboard placeholder. Los módulos de Clientes, Ventas,
          Servicios, Productos, Agenda y Estadísticas todavía no se
          reconstruyeron — se pueden ir agregando de a uno.
        </p>
      </Card>
    </DashboardLayout>
  );
}
