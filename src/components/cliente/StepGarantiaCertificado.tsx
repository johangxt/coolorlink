import React, { useState, useEffect } from 'react';
import { EvaluacionCalidad, Usuario } from '../../types/database';
import { Star, ShieldCheck, Printer, Award, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface StepGarantiaCertificadoProps {
  proyectoId: string;
  codigoProyecto: string;
  citaId: string;
  pintorId: string;
  onResetWizard: () => void;
}

export const StepGarantiaCertificado: React.FC<StepGarantiaCertificadoProps> = ({
  proyectoId,
  codigoProyecto,
  citaId,
  onResetWizard,
}) => {
  const { currentUser } = useAuth();
  const [calificacion, setCalificacion] = useState<number>(5);
  const [comentariosCliente, setComentariosCliente] = useState<string>('Excelente cubrimiento, tono exacto y cumplimiento de la norma técnica Pintuco.');
  const [evaluacion, setEvaluacion] = useState<EvaluacionCalidad | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing EvaluacionCalidad for this cita_servicio_id
  useEffect(() => {
    const fetchEvaluacion = async () => {
      try {
        const { data, error } = await supabase
          .from('EvaluacionesCalidad')
          .select('*')
          .eq('cita_servicio_id', citaId);

        if (!error && data && data.length > 0) {
          const record = data[0] as EvaluacionCalidad;
          setEvaluacion(record);
          setCalificacion(record.calificacion_cliente);
          setComentariosCliente(record.comentarios_cliente);
        }
      } catch (err) {
        console.error('Error fetching EvaluacionesCalidad', err);
      }
    };

    fetchEvaluacion();
  }, [citaId]);

  /**
   * INSERT estricto en EvaluacionesCalidad:
   * - cita_servicio_id
   * - calificacion_cliente (1 a 5)
   * - comentarios_cliente
   * - estado_garantia ('Sin reclamos')
   */
  const handleSaveEvaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const evalPayload: EvaluacionCalidad = {
        id: `eval_${Date.now()}`,
        cita_servicio_id: citaId,
        calificacion_cliente: Number(calificacion),
        comentarios_cliente: comentariosCliente.trim(),
        estado_garantia: 'Sin reclamos', // Inicializado correctamente según esquema
      };

      const { data, error } = await supabase
        .from('EvaluacionesCalidad')
        .insert(evalPayload);

      if (error) {
        throw new Error(`Error en EvaluacionesCalidad: ${error.message}`);
      }

      setEvaluacion(evalPayload);

      try {
        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0033A0', '#FFC72C', '#10B981'],
        });
      } catch {}
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la evaluación en Supabase');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* Formulario de Evaluación de Calidad conectado a EvaluacionesCalidad */}
      {!evaluacion ? (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0033A0] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Evaluación de Calidad y Emisión de Garantía
            </h3>
            <p className="text-xs text-slate-500">
              Conexión directa con la tabla <code className="text-[#0033A0] font-mono">EvaluacionesCalidad</code>. El estado de la garantía se inicializa como <strong className="text-slate-700 font-mono">'Sin reclamos'</strong>.
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvaluacion} className="space-y-5 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Calificación del Cliente (calificacion_cliente: 1 a 5)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCalificacion(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= calificacion
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700 block mt-1 font-mono">
                  {calificacion} de 5 Estrellas
                </span>
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comentarios del Cliente (comentarios_cliente)
                </label>
                <textarea
                  rows={3}
                  required
                  value={comentariosCliente}
                  onChange={(e) => setComentariosCliente(e.target.value)}
                  placeholder="Describe la experiencia de aplicación..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0]"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-[#0033A0] hover:bg-[#002575] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Award className="w-4 h-4 text-[#FFC72C]" />
                <span>{isSaving ? 'Guardando en EvaluacionesCalidad...' : 'Emitir Certificado Oficial de Garantía'}</span>
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Certificado Oficial basado estrictamente en el registro de EvaluacionesCalidad */}
      {evaluacion && (
        <div
          id="pintuco-certificate"
          className="bg-white rounded-3xl border-4 border-[#0033A0] shadow-xl p-8 sm:p-12 relative overflow-hidden max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2 border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0033A0] flex items-center justify-center border-2 border-[#FFC72C] shadow-md">
                <span className="font-extrabold text-2xl text-[#FFC72C]">P</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#0033A0] tracking-tight">
                  PINTUCO COLOMBIA S.A.
                </h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Certificado de Garantía ColorLink
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[11px] font-mono text-slate-500 block">ID Evaluación:</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                {evaluacion.id}
              </span>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ESTADO DE GARANTÍA: {evaluacion.estado_garantia}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              CERTIFICADO DE CALIDAD Y GARANTÍA
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Registro validado en la tabla <code className="text-[#0033A0] font-mono">EvaluacionesCalidad</code> para la cita de servicio asignada.
            </p>
          </div>

          {/* Table Data Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Código de Proyecto:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{codigoProyecto}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cita de Servicio (cita_servicio_id):</span>
              <span className="font-mono font-bold text-slate-800 truncate block">{evaluacion.cita_servicio_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Calificación Obtenida:</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {evaluacion.calificacion_cliente}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Client feedback comments */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-8">
            <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Comentarios del Cliente (comentarios_cliente):</span>
            <p className="text-slate-800 italic">"{evaluacion.comentarios_cliente}"</p>
          </div>

          {/* Footer of certificate */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-[#0033A0]">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Garantía de Fábrica Pintuco</h4>
                <p className="text-[11px] text-slate-500">Respaldo directo de marca y red de pintores certificados.</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs font-bold text-slate-900 block">Titular del Proyecto</span>
              <span className="text-[11px] text-slate-500 font-mono block">
                {currentUser?.nombre_completo || 'Cliente Registrado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {evaluacion && (
        <div className="no-print flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#0033A0] hover:bg-[#002575] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#FFC72C]" />
            <span>Imprimir Certificado</span>
          </button>

          <button
            onClick={onResetWizard}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Iniciar Nueva Cotización de Proyecto</span>
          </button>
        </div>
      )}

    </div>
  );
};
