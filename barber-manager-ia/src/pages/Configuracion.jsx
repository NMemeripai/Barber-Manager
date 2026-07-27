import { useEffect, useState } from "react";
import { Save, Store } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useConfiguracion } from "../hooks/useConfiguracion";
import { saveConfiguracion, CONFIG_DEFAULT } from "../services/configuracionService";

export default function Configuracion() {
  const { config, loading, error } = useConfiguracion();
  const [form, setForm] = useState(CONFIG_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveConfiguracion(form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Configuración">
        <p className="py-10 text-center text-sm text-ink-500">Cargando configuración…</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Configuración">
        <Card>
          <p className="text-sm font-medium text-red-600">No se pudo cargar la configuración</p>
          <p className="mt-1 text-sm text-ink-500">
            Esto suele pasar si en las reglas de seguridad de Realtime Database todavía no
            agregaste el nodo <code className="rounded bg-surface-muted px-1">configuracion</code>.
            Revisá <strong>Firebase Console → Realtime Database → Reglas</strong> y agregá:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-900 p-3 text-xs text-white">
{`"configuracion": {
  ".read": "auth != null",
  ".write": "auth != null"
}`}
          </pre>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configuración">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Store size={18} />
            </div>
            <p className="text-sm font-semibold text-ink-900">Datos de la peluquería</p>
          </div>

          <div className="flex flex-col gap-4">
            <Input label="Nombre del negocio" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
            <Input label="Logo (URL de imagen)" value={form.logo} onChange={(e) => update("logo", e.target.value)} placeholder="https://…" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Teléfono" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>
            <Input label="Dirección" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
            <Input label="Horario de atención" value={form.horario} onChange={(e) => update("horario", e.target.value)} placeholder="Lun a Sáb 9 a 20hs" />
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-ink-900">Redes sociales</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Instagram" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@usuario" />
            <Input label="Facebook" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-sm font-semibold text-ink-900">Pagos e impuestos</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Métodos de pago aceptados" value={form.metodosPago} onChange={(e) => update("metodosPago", e.target.value)} placeholder="Efectivo, tarjeta, transferencia" />
            <Input label="Impuesto (%)" type="number" min="0" value={form.impuestoPorc} onChange={(e) => update("impuestoPorc", e.target.value)} />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-emerald-600">Guardado ✓</span>}
          <Button type="submit" icon={Save} loading={saving}>Guardar configuración</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
