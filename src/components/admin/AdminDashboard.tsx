import React, { useState, useEffect } from 'react';
import {
  Proyecto,
  Producto,
  MovimientoInventario,
  Usuario,
} from '../../types/database';
import { supabase } from '../../lib/supabase';
import {
  AlertTriangle,
  Package,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quick restock modal state
  const [selectedProductToRestock, setSelectedProductToRestock] = useState<Producto | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);
  const [isRestocking, setIsRestocking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [
        { data: dataProy },
        { data: dataProd },
        { data: dataMov },
        { data: dataUsr },
      ] = await Promise.all([
        supabase.from('Proyectos').select('*'),
        supabase.from('Productos').select('*'),
        supabase.from('MovimientosInventario').select('*'),
        supabase.from('Usuarios').select('*'),
      ]);

      if (dataProy) setProyectos(dataProy as Proyecto[]);
      if (dataProd) setProductos(dataProd as Producto[]);
      if (dataMov) setMovimientos(dataMov as MovimientoInventario[]);
      if (dataUsr) setUsuarios(dataUsr as Usuario[]);
    } catch (err) {
      console.error('Error fetching data from Supabase', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleDataChange = () => {
      fetchData();
    };

    window.addEventListener('supabase-data-changed', handleDataChange);
    return () => window.removeEventListener('supabase-data-changed', handleDataChange);
  }, []);

  // Filtered projects by code or client name
  const filteredProyectos = proyectos.filter((p) => {
    const user = usuarios.find((u) => u.id === p.usuario_id);
    const search = searchFilter.toLowerCase();
    return (
      p.codigo_proyecto.toLowerCase().includes(search) ||
      (user && user.nombre_completo.toLowerCase().includes(search)) ||
      (user && user.correo.toLowerCase().includes(search))
    );
  });

  // Calculate real metrics backed directly by schema
  const totalAreaM2 = proyectos.reduce((acc, p) => acc + (Number(p.area_m2) || 0), 0);
  const lowStockCount = productos.filter((p) => p.stock_disponible <= p.punto_reorden).length;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  /**
   * Acción Reabastecer:
   * UPDATE a stock_disponible en Productos
   * INSERT en MovimientosInventario (producto_id, tipo_movimiento, cantidad, fecha_movimiento)
   */
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToRestock || restockAmount <= 0) return;
    setIsRestocking(true);

    try {
      const nuevoStock = Number(selectedProductToRestock.stock_disponible) + Number(restockAmount);

      // 1. UPDATE en Productos (stock_disponible)
      const { error: updateError } = await supabase
        .from('Productos')
        .update({ stock_disponible: nuevoStock })
        .eq('id', selectedProductToRestock.id);

      if (updateError) {
        throw new Error(`Error actualizando Productos: ${updateError.message}`);
      }

      // 2. INSERT en MovimientosInventario (producto_id, tipo_movimiento, cantidad, fecha_movimiento)
      const movimientoPayload: MovimientoInventario = {
        id: `mov_${Date.now()}`,
        producto_id: selectedProductToRestock.id,
        tipo_movimiento: 'entrada',
        cantidad: Number(restockAmount),
        fecha_movimiento: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('MovimientosInventario')
        .insert(movimientoPayload);

      if (insertError) {
        throw new Error(`Error registrando MovimientosInventario: ${insertError.message}`);
      }

      setStatusMessage(`¡Entrada de ${restockAmount} galones registrada con éxito para ${selectedProductToRestock.nombre}!`);
      setTimeout(() => setStatusMessage(null), 3500);
      setSelectedProductToRestock(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al procesar el reabastecimiento');
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0033A0] font-mono">
            Módulo Gerencial & Abastecimiento
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Proyectos e Inventario Pintuco
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Datos vinculados directamente a las tablas <code className="text-[#0033A0] font-mono">Proyectos</code>, <code className="text-[#0033A0] font-mono">Productos</code> y <code className="text-[#0033A0] font-mono">MovimientosInventario</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="px-3.5 py-2 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Actualizar Datos</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Cards (Directly backed by real DB records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Proyectos Creados
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0033A0] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {proyectos.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Registros en tabla Proyectos
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Área Total Acumulada
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {totalAreaM2} <span className="text-sm font-sans font-semibold text-slate-500">m²</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Suma de Proyectos.area_m2
          </span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-xs transition-colors ${
          lowStockCount > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Alertas de Reorden
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold font-mono tabular-nums ${
            lowStockCount > 0 ? 'text-amber-800' : 'text-slate-900'
          }`}>
            {lowStockCount}
          </p>
          <span className={`text-[11px] mt-1 block ${
            lowStockCount > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'
          }`}>
            {lowStockCount > 0 ? 'Productos en o bajo punto de reorden' : 'Stock por encima del punto de reorden'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Movimientos Registrados
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {movimientos.length}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Registros en MovimientosInventario
          </span>
        </div>

      </div>

      {/* 1. PANEL DE ABASTECIMIENTO & STOCK (Productos: stock_disponible vs punto_reorden) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0033A0]" />
              <h2 className="text-base font-bold text-slate-900">
                Panel de Abastecimiento & Stock (Tabla Productos)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lectura exclusiva de <code className="text-[#0033A0] font-mono">Productos.stock_disponible</code> y <code className="text-[#0033A0] font-mono">Productos.punto_reorden</code>.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Producto (nombre)</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Rendimiento (m²/gl)</th>
                <th className="py-3 px-4 text-right">Punto de Reorden</th>
                <th className="py-3 px-4 text-right">Stock Disponible</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((prod) => {
                const isUnderReorder = prod.stock_disponible <= prod.punto_reorden;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isUnderReorder ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {prod.nombre}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-700">
                      {formatCOP(prod.precio)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-700">
                      {prod.rendimiento} m²/gl
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-700 font-semibold">
                      {prod.punto_reorden} gl
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-right text-sm">
                      <span className={isUnderReorder ? 'text-amber-800 font-extrabold' : 'text-slate-900'}>
                        {prod.stock_disponible} gl
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isUnderReorder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Alerta: Requiere Reorden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Abastecimiento Óptimo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedProductToRestock(prod);
                          setRestockAmount(20);
                        }}
                        className="px-3 py-1.5 bg-[#0033A0] hover:bg-[#002575] text-white rounded-lg font-medium text-[11px] transition-colors shadow-2xs"
                      >
                        Reabastecer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. TABLA EN TIEMPO REAL DE PROYECTOS (Proyectos) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0033A0]" />
              <h2 className="text-base font-bold text-slate-900">
                Proyectos Registrados (Tabla Proyectos)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta en tiempo real vinculada a <code className="text-[#0033A0] font-mono">Proyectos</code> y <code className="text-[#0033A0] font-mono">Usuarios</code>.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código o cliente..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Código (codigo_proyecto)</th>
                <th className="py-3 px-4">Cliente (usuario_id)</th>
                <th className="py-3 px-4 text-right">Área (area_m2)</th>
                <th className="py-3 px-4">ID Registro (id)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProyectos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No hay proyectos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredProyectos.map((proy) => {
                  const cliente = usuarios.find((u) => u.id === proy.usuario_id);

                  return (
                    <tr key={proy.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0033A0]">
                        {proy.codigo_proyecto}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {cliente?.nombre_completo || proy.usuario_id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {cliente?.correo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900 text-sm">
                        {proy.area_m2} m²
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {proy.id}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. AUDITORÍA DE MOVIMIENTOS DE INVENTARIO (MovimientosInventario) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0033A0]" />
              Auditoría de Movimientos de Inventario (Tabla MovimientosInventario)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SELECT directo a las columnas: <code className="text-[#0033A0] font-mono">id</code>, <code className="text-[#0033A0] font-mono">producto_id</code>, <code className="text-[#0033A0] font-mono">tipo_movimiento</code>, <code className="text-[#0033A0] font-mono">cantidad</code> y <code className="text-[#0033A0] font-mono">fecha_movimiento</code>.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {movimientos.length} movimientos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">ID Movimiento</th>
                <th className="py-3 px-4">Producto (producto_id)</th>
                <th className="py-3 px-4 text-center">Tipo de Movimiento</th>
                <th className="py-3 px-4 text-right">Cantidad (galones)</th>
                <th className="py-3 px-4 text-right">Fecha (fecha_movimiento)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No se registran movimientos de inventario.
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => {
                  const prod = productos.find((p) => p.id === mov.producto_id);
                  const isEntrada = mov.tipo_movimiento === 'entrada';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {mov.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {prod?.nombre || mov.producto_id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {mov.producto_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          isEntrada
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isEntrada ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {mov.tipo_movimiento}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-sm">
                        <span className={isEntrada ? 'text-emerald-700' : 'text-rose-700'}>
                          {isEntrada ? `+${mov.cantidad}` : `-${mov.cantidad}`} gl
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-500 text-[11px]">
                        {mov.fecha_movimiento ? mov.fecha_movimiento.replace('T', ' ').slice(0, 19) : 'Sin fecha'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REABASTECIMIENTO RÁPIDO */}
      {selectedProductToRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reabastecer Producto
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Actualiza <code className="text-[#0033A0] font-mono">Productos.stock_disponible</code> y registra un INSERT en <code className="text-[#0033A0] font-mono">MovimientosInventario</code> con <code className="text-[#0033A0] font-mono">fecha_movimiento</code>.
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Producto</label>
                <input
                  type="text"
                  disabled
                  value={selectedProductToRestock.nombre}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Actual</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedProductToRestock.stock_disponible} gl`}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Punto de Reorden</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedProductToRestock.punto_reorden} gl`}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad a Ingresar (galones)
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0] font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductToRestock(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-4 py-2 bg-[#0033A0] hover:bg-[#002575] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  {isRestocking ? 'Guardando en Supabase...' : 'Confirmar Reabastecimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
