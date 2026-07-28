import { useMemo, useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useClientes } from "../hooks/useClientes";
import { useServicios } from "../hooks/useServicios";
import { useProductos } from "../hooks/useProductos";
import { useVentas } from "../hooks/useVentas";
import { VENTA_DEFAULT, calcularTotales, confirmarVenta } from "../services/ventasService";

const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia"];

export default function Ventas() {
  const { clientes } = useClientes();
  const { servicios } = useServicios();
  const { productos } = useProductos();
  const { ventas, loading: loadingVentas } = useVentas();

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [items, setItems] = useState([]); // {tipo,id,nombre,precio,cantidad}
  const [descuentoPorc, setDescuentoPorc] = useState(0);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  const productosMap = useMemo(
    () => Object.fromEntries(productos.map((p) => [p.id, p])),
    [productos]
  );

  const totales = useMemo(
    () => calcularTotales(items, descuentoPorc, productosMap),
    [items, descuentoPorc, productosMap]
  );

  function abrirNuevaVenta() {
    setClienteId("");
    setItems([]);
    setDescuentoPorc(0);
    setMetodoPago("efectivo");
    setObservaciones("");
    setModalOpen(true);
  }

  function agregarItem(tipo, origen) {
    setItems((prev) => {
      const existe = prev.find((it) => it.tipo === tipo && it.id === origen.id);
      if (existe) {
        return prev.map((it) =>
          it.tipo === tipo && it.id === origen.id ? { ...it, cantidad: it.cantidad + 1 } : it
        );
      }
      return [
        ...prev,
        { tipo, id: origen.id, nombre: origen.nombre, precio: Number(origen.precio), cantidad: 1 },
      ];
    });
  }

  function cambiarCantidad(tipo, id, delta) {
    setItems((prev) =>
      prev
        .map((it) =>
          it.tipo === tipo && it.id === id
            ? { ...it, cantidad: Math.max(1, it.cantidad + delta) }
            : it
        )
        .filter((it) => it.cantidad > 0)
    );
  }

  function quitarItem(tipo, id) {
    setItems((prev) => prev.filter((it) => !(it.tipo === tipo && it.id === id)));
  }

  async function handleConfirmar() {
    if (items.length === 0) return;
    setGuardando(true);
    try {
      const cliente = clientes.find((c) => c.id === clienteId);
      const venta = {
        ...VENTA_DEFAULT,
        clienteId: clienteId || null,
        clienteNombre: cliente ? cliente.nombre : "Consumidor final",
        items,
        descuentoPorc: Number(descuentoPorc) || 0,
        metodoPago,
        observaciones,
        ...totales,
      };
      await confirmarVenta(venta, productos);
      setModalOpen(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <DashboardLayout title="Ventas">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {ventas.length} venta{ventas.length !== 1 && "s"} registrada
            {ventas.length !== 1 && "s"}
          </p>
          <Button icon={Plus} onClick={abrirNuevaVenta}>
            Nueva venta
          </Button>
        </div>

        {loadingVentas && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {!loadingVentas && ventas.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <Receipt className="text-ink-300" size={28} />
            <p className="text-sm text-ink-500">Todavía no registraste ninguna venta.</p>
          </Card>
        )}

        {!loadingVentas && ventas.length > 0 && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-300/30 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} className="border-b border-ink-300/20 last:border-0">
                    <td className="px-4 py-3 font-medium text-ink-900">{v.clienteNombre}</td>
                    <td className="px-4 py-3 text-ink-700">
                      {v.items?.length || 0} item{v.items?.length !== 1 && "s"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="brand">{v.metodoPago}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900">
                      ${Number(v.total).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {v.creadoEn ? new Date(v.creadoEn).toLocaleDateString("es-AR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva venta">
        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto pr-1">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-700">Cliente</span>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="rounded-xl border border-ink-300/50 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Consumidor final</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Servicios</p>
            <div className="flex flex-wrap gap-2">
              {servicios
                .filter((s) => s.activo)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => agregarItem("servicio", s)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                  >
                    {s.nombre} · ${Number(s.precio).toLocaleString("es-AR")}
                  </button>
                ))}
              {servicios.length === 0 && (
                <p className="text-xs text-ink-500">No hay servicios cargados.</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Productos</p>
            <div className="flex flex-wrap gap-2">
              {productos
                .filter((p) => p.activo && Number(p.stock) > 0)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => agregarItem("producto", p)}
                    className="rounded-full border border-ink-300/50 bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-300/40"
                  >
                    {p.nombre} · ${Number(p.precio).toLocaleString("es-AR")}
                  </button>
                ))}
              {productos.length === 0 && (
                <p className="text-xs text-ink-500">No hay productos con stock.</p>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-ink-300/30 p-3">
              {items.map((it) => (
                <div key={`${it.tipo}-${it.id}`} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink-900">{it.nombre}</p>
                    <p className="text-xs text-ink-500">
                      ${it.precio.toLocaleString("es-AR")} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(it.tipo, it.id, -1)}
                      className="rounded-lg bg-surface-muted p-1 text-ink-700"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center">{it.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(it.tipo, it.id, 1)}
                      className="rounded-lg bg-surface-muted p-1 text-ink-700"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => quitarItem(it.tipo, it.id)}
                      className="ml-1 rounded-lg p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Descuento (%)"
              type="number"
              min="0"
              max="100"
              value={descuentoPorc}
              onChange={(e) => setDescuentoPorc(e.target.value)}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink-700">Método de pago</span>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="rounded-xl border border-ink-300/50 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Input
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          <div className="flex flex-col gap-1 rounded-xl bg-surface-muted p-4 text-sm">
            <div className="flex justify-between text-ink-700">
              <span>Subtotal</span>
              <span>${totales.subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Descuento</span>
              <span>-${totales.descuento.toLocaleString("es-AR")}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-ink-300/30 pt-1 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span>${totales.total.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              icon={ShoppingCart}
              onClick={handleConfirmar}
              loading={guardando}
              disabled={items.length === 0}
            >
              Confirmar venta
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
