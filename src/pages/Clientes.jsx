import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Users, Search, Star } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useClientes } from "../hooks/useClientes";
import {
  CLIENTE_DEFAULT,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/clientesService";

export default function Clientes() {
  const { clientes, loading, error } = useClientes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(CLIENTE_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [borrarId, setBorrarId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos"); // todos | vip | activos | inactivos

  const filtrados = useMemo(() => {
    let lista = clientes;
    if (filtro === "vip") lista = lista.filter((c) => c.vip);
    if (filtro === "activos") lista = lista.filter((c) => c.activo);
    if (filtro === "inactivos") lista = lista.filter((c) => !c.activo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(q) ||
          c.telefono?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [clientes, filtro, busqueda]);

  function abrirNuevo() {
    setEditando(null);
    setForm(CLIENTE_DEFAULT);
    setModalOpen(true);
  }

  function abrirEditar(cliente) {
    setEditando(cliente.id);
    setForm(cliente);
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editando) {
        await actualizarCliente(editando, form);
      } else {
        await crearCliente(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarBorrar() {
    if (!borrarId) return;
    await eliminarCliente(borrarId);
    setBorrarId(null);
  }

  return (
    <DashboardLayout title="Clientes">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, teléfono o email…"
              className="w-full rounded-xl border border-ink-300/50 bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Button icon={Plus} onClick={abrirNuevo}>
            Nuevo cliente
          </Button>
        </div>

        <div className="flex gap-2">
          {[
            { key: "todos", label: "Todos" },
            { key: "vip", label: "VIP" },
            { key: "activos", label: "Activos" },
            { key: "inactivos", label: "Inactivos" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filtro === f.key
                  ? "bg-brand-600 text-white"
                  : "bg-surface-muted text-ink-700 hover:bg-ink-300/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <Card>
            <p className="text-sm text-red-600">No se pudieron cargar los clientes.</p>
          </Card>
        )}

        {!loading && !error && filtrados.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="text-ink-300" size={28} />
            <p className="text-sm text-ink-500">No hay clientes que coincidan.</p>
          </Card>
        )}

        {!loading && filtrados.length > 0 && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-300/30 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Visitas</th>
                  <th className="px-4 py-3">Total gastado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-ink-300/20 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-ink-900">{c.nombre}</p>
                        {c.vip && <Star size={13} className="fill-amber-400 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      <p>{c.telefono}</p>
                      <p className="text-xs text-ink-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-900">{c.visitas || 0}</td>
                    <td className="px-4 py-3 text-ink-900">
                      ${Number(c.totalGastado || 0).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={c.activo ? "success" : "neutral"}>
                        {c.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => abrirEditar(c)}
                          className="rounded-lg p-2 text-ink-500 hover:bg-surface-muted"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setBorrarId(c.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? "Editar cliente" : "Nuevo cliente"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Teléfono" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <Input label="Notas" value={form.notas} onChange={(e) => update("notas", e.target.value)} />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.vip} onChange={(e) => update("vip", e.target.checked)} />
              Cliente VIP
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.activo} onChange={(e) => update("activo", e.target.checked)} />
              Activo
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editando ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!borrarId} onClose={() => setBorrarId(null)} title="Eliminar cliente">
        <p className="text-sm text-ink-700">
          ¿Seguro que querés eliminar este cliente? Esta acción no se puede deshacer.
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
