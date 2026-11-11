import React, { useState, useEffect } from 'react';
import { Pintor, Producto, Color, EstadoSuperficie, TipoEspacio, Usuario } from '../../types/database';
import { Star, Calendar, CheckCircle2, Shield, AlertCircle, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface StepPedidoServicioProps {
  pintores: Pintor[];
  selectedProducto?: Producto;
  selectedColor?: Color;
  selectedEspacio?: TipoEspacio;
  selectedEstadoSuperficie?: EstadoSuperficie;
  areaM2: number;
  onProjectCreated: (projectData: {
    proyectoId: string;
    codigoProyecto: string;
    citaId: string;
    pintorId: string;
    fechaServicio: string;
  }) => void;
}

export const StepPedidoServicio: React.FC<StepPedidoServicioProps> = ({
  pintores,
  selectedProducto,
  selectedColor,
  selectedEspacio,
  selectedEstadoSuperficie,
  areaM2,
  onProjectCreated,
}) => {
  const { currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedPintorId, setSelectedPintorId] = useState<string>(pintores[0]?.id || '');
  const [fechaServicio, setFechaServicio] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return `${d.toISOString().slice(0, 10)}T08:00`;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUsuarios = async () => {
      const { data } = await supabase.from('Usuarios').select('*');
      if (data) setUsuarios(data as Usuario[]);
    };
    loadUsuarios();
  }, []);

  const factor = selectedEstadoSuperficie?.factor_rendimiento || 1.0;
  const rendimientoBase = selectedProducto?.rendimiento || 25;
  const galonesRequeridos = Math.max(1, Math.ceil(areaM2 / (rendimientoBase * factor)));

  const costoMateriales = (selectedProducto?.precio || 94900) * galonesRequeridos;
  const tarifaManoObraM2 = 18000;
  const costoManoObra = areaM2 * tarifaManoObraM2;
  const totalInversion = costoMateriales + costoManoObra;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage('Debes iniciar sesión para confirmar el proyecto.');
      return;
    }

    if (!selectedPintorId) {
      setErrorMessage('Por favor selecciona un pintor certificado.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const codigoGenerado = `PRY-2026-${Math.floor(100 + Math.random() * 900)}`;
      const proyectoId = `pry_${Date.now()}`;
      const citaId = `cita_${Date.now()}`;

      // 1. Inserción estricta en tabla Proyectos: id, usuario_id, codigo_proyecto, area_m2
      const proyectoPayload = {
        id: proyectoId,
        usuario_id: currentUser.id,
        codigo_proyecto: codigoGenerado,
        area_m2: Number(areaM2),
      };

      const { error: errorProyecto } = await supabase.from('Proyectos').insert(proyectoPayload);
      if (errorProyecto) {
        throw new Error(`Error en tabla Proyectos: ${errorProyecto.message}`);
      }

      // 2. Inserción estricta en tabla CitasServicio: id, proyecto_id, pintor_id, fecha_servicio
      const citaPayload = {
        id: citaId,
        proyecto_id: proyectoId,
        pintor_id: selectedPintorId,
        fecha_servicio: fechaServicio,
      };

      const { error: errorCita } = await supabase.from('CitasServicio').insert(citaPayload);
      if (errorCita) {
        throw new Error(`Error en tabla CitasServicio: ${errorCita.message}`);
      }

      // 3. Inserción estricta en tabla MovimientosInventario: id, producto_id, tipo_movimiento, cantidad, fecha_movimiento
      if (selectedProducto) {
        const movimientoPayload = {
          id: `mov_${Date.now()}`,
          producto_id: selectedProducto.id,
          tipo_movimiento: 'salida',
          cantidad: galonesRequeridos,
          fecha_movimiento: new Date().toISOString(),
        };

        const { error: errorMov } = await supabase.from('MovimientosInventario').insert(movimientoPayload);
        if (errorMov) {
          console.warn('Advertencia en MovimientosInventario:', errorMov);
        }

        // Actualización directa en Productos (stock_disponible)
        const nuevoStock = Math.max(0, Number(selectedProducto.stock_disponible) - galonesRequeridos);
        await supabase
          .from('Productos')
          .update({ stock_disponible: nuevoStock })
          .eq('id', selectedProducto.id);
      }

      // Avanzar al paso de Garantía
      onProjectCreated({
        proyectoId,
        codigoProyecto: codigoGenerado,
        citaId,
        pintorId: selectedPintorId,
        fechaServicio,
      });

    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al procesar el pedido y servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Pintores + Resumen de Costos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Selección de Pintor y Fecha (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              1. Selecciona tu Pintor de la Red Certificada (Tabla Pintores)
            </h3>
            <p className="text-xs text-slate-500">
              Datos vinculados a <code className="text-[#0033A0] font-mono">Pintores</code>: certificacion y calificacion_promedio.
            </p>
          </div>

          <div className="space-y-3">
            {pintores.map((p) => {
              const isSelected = p.id === selectedPintorId;
              const usuarioPintor = usuarios.find((u) => u.id === p.usuario_id);

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPintorId(p.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-[#0033A0] bg-blue-50/60 shadow-sm ring-1 ring-[#0033A0]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#0033A0] text-white flex items-center justify-center font-bold text-base shrink-0">
                      {usuarioPintor?.nombre_completo
                        ? usuarioPintor.nombre_completo.slice(0, 2).toUpperCase()
                        : 'PT'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {usuarioPintor?.nombre_completo || `Pintor (${p.id})`}
                        </h4>
                        <span className="flex items-center text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          {p.calificacion_promedio}
                        </span>
                      </div>

                      <p className="text-xs text-[#0033A0] font-medium flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5" />
                        {p.certificacion}
                      </p>

                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ID: {p.id} · Usuario: {p.usuario_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isSelected ? (
                      <span className="bg-[#0033A0] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC72C]" />
                        Asignado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedPintorId(p.id)}
                        className="px-3 py-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-medium rounded-lg"
                      >
                        Seleccionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agendamiento de CitaServicio */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0033A0]" />
              Fecha del Servicio (CitasServicio.fecha_servicio)
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha y Hora Programada
              </label>
              <input
                type="datetime-local"
                required
                value={fechaServicio}
                onChange={(e) => setFechaServicio(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Resumen y Confirmación */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Resumen de Inserción</span>
              <span className="text-xs font-mono text-[#FFC72C] font-semibold">Proyectos & Citas</span>
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Espacio Seleccionado:</span>
                <span className="text-white font-medium">{selectedEspacio?.nombre || 'Sala'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Superficie:</span>
                <span className="text-white font-medium">{selectedEstadoSuperficie?.nombre || 'Lisa'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Color:</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 inline-block"
                    style={{ backgroundColor: selectedColor?.codigo_hex || '#0033A0' }}
                  />
                  {selectedColor?.nombre || 'Azul Pintuco'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Área (area_m2):</span>
                <span className="text-white font-mono font-medium">{areaM2} m²</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Producto:</span>
                <span className="text-white font-medium text-right truncate max-w-[180px]">
                  {selectedProducto?.nombre}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cantidad Requerida:</span>
                <span className="text-[#FFC72C] font-mono font-bold">{galonesRequeridos} galones</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Pintura ({galonesRequeridos} gl × {formatCOP(selectedProducto?.precio || 0)}):</span>
                <span className="font-mono text-white tabular-nums">{formatCOP(costoMateriales)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mano de Obra ({areaM2} m² × $18.000):</span>
                <span className="font-mono text-white tabular-nums">{formatCOP(costoManoObra)}</span>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                    Total Cotizado
                  </span>
                </div>
                <span className="text-xl font-mono font-extrabold text-[#FFC72C] tabular-nums">
                  {formatCOP(totalInversion)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full py-3 px-4 bg-[#0033A0] hover:bg-[#002575] border border-[#FFC72C]/40 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
              <span>{isSubmitting ? 'Guardando en Supabase...' : 'Confirmar Pedido y Agendar Cita'}</span>
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Ejecuta INSERT en <code className="text-slate-300">Proyectos</code>, <code className="text-slate-300">CitasServicio</code> y descuenta stock con INSERT en <code className="text-slate-300">MovimientosInventario</code>.
            </p>
          </div>
        </div>

      </div>

    </form>
  );
};
