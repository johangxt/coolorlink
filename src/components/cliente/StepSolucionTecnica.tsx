import React, { useState } from 'react';
import { Color, Producto, EstadoSuperficie } from '../../types/database';
import { Check, AlertTriangle, Eye } from 'lucide-react';

interface StepSolucionTecnicaProps {
  colores: Color[];
  productos: Producto[];
  selectedColorId: string;
  onSelectColor: (id: string) => void;
  selectedProductoId: string;
  onSelectProducto: (id: string) => void;
  areaM2: number;
  estadoSuperficie?: EstadoSuperficie;
}

export const StepSolucionTecnica: React.FC<StepSolucionTecnicaProps> = ({
  colores,
  productos,
  selectedColorId,
  onSelectColor,
  selectedProductoId,
  onSelectProducto,
  areaM2,
  estadoSuperficie,
}) => {
  const [selectedColeccion, setSelectedColeccion] = useState<string>('todos');

  const selectedColor = colores.find((c) => c.id === selectedColorId) || colores[0];
  const factor = estadoSuperficie?.factor_rendimiento || 1.0;

  // Filter collections by distinct Colores.coleccion
  const colecciones = ['todos', ...Array.from(new Set(colores.map((c) => c.coleccion)))];

  const filteredColores =
    selectedColeccion === 'todos'
      ? colores
      : colores.filter((c) => c.coleccion === selectedColeccion);

  // Calculate gallons required for a product based on rendimiento & factor
  const calculateGallons = (rendimiento: number) => {
    const effectiveRendimiento = rendimiento * factor;
    return Math.max(1, Math.ceil(areaM2 / effectiveRendimiento));
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Selector de Colores (Tabla Colores: id, nombre, codigo_hex, coleccion, acabado) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Selector de Colores (Tabla Colores)
            </h3>
            <p className="text-xs text-slate-500">
              Lectura directa de las columnas <code className="text-[#0033A0] font-mono">codigo_hex</code>, <code className="text-[#0033A0] font-mono">coleccion</code> y <code className="text-[#0033A0] font-mono">acabado</code>.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {colecciones.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColeccion(col)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedColeccion === col
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {col === 'todos' ? 'Todas las Colecciones' : col}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredColores.map((color) => {
            const isSelected = color.id === selectedColorId;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0033A0] shadow-sm ring-2 ring-[#0033A0]/30 bg-blue-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className="w-full h-16 rounded-lg mb-2.5 border border-black/10 relative shadow-inner flex items-end justify-end p-1.5"
                  style={{ backgroundColor: color.codigo_hex }}
                >
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-[#0033A0] flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{color.nombre}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5 font-mono">
                    <span>{color.codigo_hex}</span>
                    <span>{color.acabado}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Wall Color Simulation Box */}
        {selectedColor && (
          <div className="mt-4 p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div
                className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-md shrink-0"
                style={{ backgroundColor: selectedColor.codigo_hex }}
              />
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#FFC72C] font-semibold">
                  Tono Seleccionado
                </span>
                <h4 className="text-base font-bold text-white leading-tight">
                  {selectedColor.nombre}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Colección: {selectedColor.coleccion} · Acabado: {selectedColor.acabado}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
              <Eye className="w-4 h-4 text-[#FFC72C]" />
              <span>
                Cálculo para <strong className="text-white font-mono">{areaM2} m²</strong>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Productos Recomendados (Tabla Productos: id, nombre, precio, rendimiento, stock_disponible, punto_reorden) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Productos Recomendados (Tabla Productos)
            </h3>
            <p className="text-xs text-slate-500">
              Cálculo de galones según <code className="text-[#0033A0] font-mono">rendimiento</code> y disponibilidad en <code className="text-[#0033A0] font-mono">stock_disponible</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((prod) => {
            const isSelected = prod.id === selectedProductoId;
            const galones = calculateGallons(prod.rendimiento);
            const totalCosto = galones * prod.precio;
            const isLowStock = prod.stock_disponible <= prod.punto_reorden;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProducto(prod.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0033A0] bg-blue-50/50 shadow-md ring-2 ring-[#0033A0]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {prod.id}
                    </span>
                    {isSelected && (
                      <span className="bg-[#0033A0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Seleccionado
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-3 leading-snug">
                    {prod.nombre}
                  </h4>

                  {/* Technical Specs Grid strictly matching Productos columns */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs mb-4">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Rendimiento:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {prod.rendimiento} m²/gl
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Precio Galón:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatCOP(prod.precio)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Punto Reorden:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {prod.punto_reorden} gl
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Stock Disponible:</span>
                      <span className={`font-mono font-semibold ${isLowStock ? 'text-amber-600 font-bold' : 'text-slate-800'}`}>
                        {prod.stock_disponible} gl
                      </span>
                    </div>
                  </div>

                  {isLowStock && (
                    <div className="mb-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Stock en o bajo punto de reorden ({prod.punto_reorden} gl)</span>
                    </div>
                  )}
                </div>

                {/* Calculation Summary Footer */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Galones Estimados:</span>
                    <span className="font-mono font-bold text-sm text-[#0033A0]">
                      {galones} {galones === 1 ? 'galón' : 'galones'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Subtotal:</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      {formatCOP(totalCosto)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
