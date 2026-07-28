import { useMemo, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useAgenda } from "../hooks/useAgenda";
import { useClientes } from "../hooks/useClientes";
import { useServicios } from "../hooks/useServicios";
import {
  TURNO_DEFAULT,
  ESTADOS_TURNO,
  crearTurno,
  eliminarTurno,
  cambiarEstadoTurno,
} from "../services/agendaService";

const COLOR_ESTADO = {
  Pendiente: "warning",
  Confirmado: "brand",
  Cancelado: "danger",
  Finalizado: "success",
};

export default function Agenda() {
  const { turnos, loading } = useAgenda();
  const { clientes } = useClientes();
  const { servicios } = useServicios();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(TURNO_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [borrarId, setBorrarId] = useState(null);

  const agrupados = useMemo(() => {
    const grupos = {};
    for (const t of turnos) {
      const key = t.fecha || "Sin fecha";
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(t);
    }
    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, lista]) => [
        fecha,
        lista.sort((a, b) => (a.hora || "").localeCompare(b.hora || "")),
      ]);
  }, [turnos]);

  function abrirNuevo() {
    setForm(TURNO_DEFAULT);
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function onClienteChange(id) {
    const c = clientes.find((c) => c.id === id);
    setForm((f) => ({ ...f, clienteId: id || null, clienteNombre: c ? c.nombre : "" }));
  }

  function onServicioChange(id) {
    const s = servicios.find((s) => s.id === id);
    setForm((f) => ({ ...f, servicioId: id || null, servicioNombre: s ? s.nombre : "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await crearTurno(form);
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarBorrar() {
    if (!borrarId) return;
    await eliminarTurno(borrarId);
    setBorrarId(null);
  }

  return (
    <DashboardLayout title="Agenda">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {turnos.length} turno{turnos.length !== 1 && "s"} agendado
            {turnos.length !== 1 && "s"}
          </p>
          <Button icon={Plus} onClick={abrirNuevo}>
            Nuevo turno
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loading && turnos.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarDays className="text-ink-300" size={28} />
            <p className="text-sm text-ink-500">No hay turnos agendados todavía.</p>
          </Card>
        )}

        {!loading &&
          agrupados.map(([fecha, lista]) => (
            <div key={fecha} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-ink-900">
                {fecha !== "Sin fecha"
                  ? new Date(fecha + "T00:00").toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "Sin fecha"}
              </p>
              <Card className="flex flex-col divide-y divide-ink-300/20 p-0">
                {lista.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-sm font-medium text-ink-900">{t.hora}</span>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{t.clienteNombre || "Sin cliente"}</p>
                        <p className="text-xs text-ink-500">{t.servicioNombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={t.estado}
                        onChange={(e) => cambiarEstadoTurno(t.id, e.target.value)}
                        className="rounded-lg border border-ink-300/40 bg-surface px-2 py-1 text-xs"
                      >
                        {ESTADOS_TURNO.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <Badge color={COLOR_ESTADO[t.estado] || "neutral"}>{t.estado}</Badge>
                      <button
                        onClick={() => setBorrarId(t.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo turno">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-700">Cliente</span>
            <select
              value={form.clienteId || ""}
              onChange={(e) => onClienteChange(e.target.value)}
              className="rounded-xl border border-ink-300/50 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Seleccionar cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-700">Servicio</span>
            <select
              value={form.servicioId || ""}
              onChange={(e) => onServicioChange(e.target.value)}
              className="rounded-xl border border-ink-300/50 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Seleccionar servicio…</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={form.fecha} onChange={(e) => update("fecha", e.target.value)} required />
            <Input label="Hora" type="time" value={form.hora} onChange={(e) => update("hora", e.target.value)} required />
          </div>

          <Input label="Notas / recordatorio" value={form.notas} onChange={(e) => update("notas", e.target.value)} />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear turno
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!borrarId} onClose={() => setBorrarId(null)} title="Eliminar turno">
        <p className="text-sm text-ink-700">¿Seguro que querés eliminar este turno?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setBorrarId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarBorrar}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
