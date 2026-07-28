import { useState } from "react";
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useProductos } from "../hooks/useProductos";
import {
  PRODUCTO_DEFAULT,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  calcularGanancia,
} from "../services/productosService";

export default function Productos() {
  const { productos, loading, error } = useProductos();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(PRODUCTO_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [borrarId, setBorrarId] = useState(null);

  function abrirNuevo() {
    setEditando(null);
    setForm(PRODUCTO_DEFAULT);
    setModalOpen(true);
  }

  function abrirEditar(producto) {
    setEditando(producto.id);
    setForm(producto);
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
        costo: Number(form.costo) || 0,
        stock: Number(form.stock) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
      };
      if (editando) {
        await actualizarProducto(editando, payload);
      } else {
        await crearProducto(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarBorrar() {
    if (!borrarId) return;
    await eliminarProducto(borrarId);
    setBorrarId(null);
  }

  return (
    <DashboardLayout title="Productos">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {productos.length} producto{productos.length !== 1 && "s"} cargado
            {productos.length !== 1 && "s"}
          </p>
          <Button icon={Plus} onClick={abrirNuevo}>
            Nuevo producto
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <Card>
            <p className="text-sm text-red-600">No se pudieron cargar los productos.</p>
          </Card>
        )}

        {!loading && !error && productos.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <Package className="text-ink-300" size={28} />
            <p className="text-sm text-ink-500">Todavía no cargaste ningún producto.</p>
          </Card>
        )}

        {!loading && productos.length > 0 && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-300/30 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Ganancia</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const stockBajo = Number(p.stock) <= Number(p.stockMinimo);
                  return (
                    <tr key={p.id} className="border-b border-ink-300/20 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-900">{p.nombre}</p>
                        <p className="text-xs text-ink-500">{p.marca}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{p.categoria || "—"}</td>
                      <td className="px-4 py-3 text-ink-900">
                        ${Number(p.precio).toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-emerald-600">
                        {calcularGanancia(p.precio, p.costo)}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsxStock(stockBajo)}
                        >
                          {stockBajo && <AlertTriangle size={12} />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={p.activo ? "success" : "neutral"}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => abrirEditar(p)}
                            className="rounded-lg p-2 text-ink-500 hover:bg-surface-muted"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setBorrarId(p.id)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? "Editar producto" : "Nuevo producto"}
      >
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <Input label="Nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" value={form.marca} onChange={(e) => update("marca", e.target.value)} />
            <Input label="Categoría" value={form.categoria} onChange={(e) => update("categoria", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Código" value={form.codigo} onChange={(e) => update("codigo", e.target.value)} />
            <Input label="Proveedor" value={form.proveedor} onChange={(e) => update("proveedor", e.target.value)} />
          </div>
          <Input label="Imagen (URL)" value={form.imagen} onChange={(e) => update("imagen", e.target.value)} placeholder="https://…" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Precio de venta" type="number" min="0" value={form.precio} onChange={(e) => update("precio", e.target.value)} required />
            <Input label="Costo" type="number" min="0" value={form.costo} onChange={(e) => update("costo", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock actual" type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} required />
            <Input label="Stock mínimo (alerta)" type="number" min="0" value={form.stockMinimo} onChange={(e) => update("stockMinimo", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.activo} onChange={(e) => update("activo", e.target.checked)} />
            Producto activo
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editando ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!borrarId} onClose={() => setBorrarId(null)} title="Eliminar producto">
        <p className="text-sm text-ink-700">
          ¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.
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

function clsxStock(stockBajo) {
  return stockBajo
    ? "inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
    : "text-ink-900";
}
