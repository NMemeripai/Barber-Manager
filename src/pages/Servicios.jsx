import { useState } from "react";
import { Plus, Pencil, Trash2, Clock, Scissors } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useServicios } from "../hooks/useServicios";
import {
  SERVICIO_DEFAULT,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "../services/serviciosService";

export default function Servicios() {
  const { servicios, loading, error } = useServicios();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null); // id o null
  const [form, setForm] = useState(SERVICIO_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [borrarId, setBorrarId] = useState(null);

  function abrirNuevo() {
    setEditando(null);
    setForm(SERVICIO_DEFAULT);
    setModalOpen(true);
  }

  function abrirEditar(servicio) {
    setEditando(servicio.id);
    setForm(servicio);
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        precio: Number(form.precio) || 0,
        duracion: Number(form.duracion) || 0,
      };
      if (editando) {
        await actualizarServicio(editando, payload);
      } else {
        await crearServicio(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarBorrar() {
    if (!borrarId) return;
    await eliminarServicio(borrarId);
    setBorrarId(null);
  }

  return (
    <DashboardLayout title="Servicios">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {servicios.length} servicio{servicios.length !== 1 && "s"} cargado
            {servicios.length !== 1 && "s"}
          </p>
          <Button icon={Plus} onClick={abrirNuevo}>
            Nuevo servicio
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <Card>
            <p className="text-sm text-red-600">No se pudieron cargar los servicios.</p>
          </Card>
        )}

        {!loading && !error && servicios.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <Scissors className="text-ink-300" size={28} />
            <p className="text-sm text-ink-500">Todavía no cargaste ningún servicio.</p>
          </Card>
        )}

        {!loading && servicios.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((s) => (
              <Card key={s.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{s.nombre}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                      <Clock size={12} /> {s.duracion} min
                    </p>
                  </div>
                  <Badge color={s.activo ? "success" : "neutral"}>
                    {s.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {s.descripcion && (
                  <p className="text-sm text-ink-700">{s.descripcion}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-ink-900">
                    ${Number(s.precio).toLocaleString("es-AR")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(s)}
                      className="rounded-lg p-2 text-ink-500 hover:bg-surface-muted"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setBorrarId(s.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? "Editar servicio" : "Nuevo servicio"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => update("nombre", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio"
              type="number"
              min="0"
              value={form.precio}
              onChange={(e) => update("precio", e.target.value)}
              required
            />
            <Input
              label="Duración (min)"
              type="number"
              min="0"
              value={form.duracion}
              onChange={(e) => update("duracion", e.target.value)}
              required
            />
          </div>
          <Input
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => update("activo", e.target.checked)}
            />
            Servicio activo
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editando ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmar borrado */}
      <Modal
        open={!!borrarId}
        onClose={() => setBorrarId(null)}
        title="Eliminar servicio"
      >
        <p className="text-sm text-ink-700">
          ¿Seguro que querés eliminar este servicio? Esta acción no se puede deshacer.
        </p>
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
