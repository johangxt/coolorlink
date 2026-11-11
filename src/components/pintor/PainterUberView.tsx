import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CitaServicio,
  Pintor,
  Proyecto,
  Usuario,
  EvaluacionCalidad,
} from '../../types/database';
import { supabase } from '../../lib/supabase';
import {
  Calendar,
  Star,
  Award,
  Layers,
  ShieldCheck,
  RefreshCw,
  User,
} from 'lucide-react';

export const PainterUberView: React.FC = () => {
  const { currentUser } = useAuth();
  const [painterRecord, setPainterRecord] = useState<Pintor | null>(null);
  const [citas, setCitas] = useState<CitaServicio[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionCalidad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPainterData = async () => {
    try {
      setIsLoading(true);
      // 1. Get Pintores record
      const { data: allPainters } = await supabase.from('Pintores').select('*');
      if (!allPainters || allPainters.length === 0) return;

      const paintersList = allPainters as Pintor[];
      let matched = paintersList.find((p) => p.usuario_id === currentUser?.id) || paintersList[0];
      if (!matched) return;
      setPainterRecord(matched);

      // 2. Query CitasServicio strictly filtering by pintor_id
      const [
        { data: dataCitas },
        { data: dataProy },
        { data: dataUsr },
        { data: dataEval },
      ] = await Promise.all([
        supabase.from('CitasServicio').select('*').eq('pintor_id', matched.id),
        supabase.from('Proyectos').select('*'),
        supabase.from('Usuarios').select('*'),
        supabase.from('EvaluacionesCalidad').select('*'),
      ]);

      if (dataCitas) setCitas(dataCitas as CitaServicio[]);
      if (dataProy) setProyectos(dataProy as Proyecto[]);
      if (dataUsr) setUsuarios(dataUsr as Usuario[]);
      if (dataEval) setEvaluaciones(dataEval as EvaluacionCalidad[]);
    } catch (err) {
      console.error('Error fetching data for Pintores in Supabase', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPainterData();

    const handleDataChange = () => {
      fetchPainterData();
    };

    window.addEventListener('supabase-data-changed', handleDataChange);
    return () => window.removeEventListener('supabase-data-changed', handleDataChange);
  }, [currentUser]);

  if (isLoading && !painterRecord) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#0033A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-medium">Cargando citas de servicio desde Supabase...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Painter Profile Card (strictly backed by Pintores and Usuarios) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0033A0] border-2 border-[#FFC72C] flex items-center justify-center font-extrabold text-xl text-[#FFC72C] shadow-sm">
              {currentUser?.nombre_completo ? currentUser.nombre_completo.slice(0, 2).toUpperCase() : 'PT'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {currentUser?.nombre_completo || 'Pintor Profesional'}
                </h2>
                {painterRecord && (
                  <span className="flex items-center text-amber-400 font-mono text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {painterRecord.calificacion_promedio}
                  </span>
                )}
              </div>

              {painterRecord && (
                <p className="text-xs text-[#FFC72C] font-medium flex items-center gap-1.5 mt-1">
                  <Award className="w-3.5 h-3.5" />
                  {painterRecord.certificacion}
                </p>
              )}

              <div className="text-[11px] text-slate-400 font-mono mt-1">
                ID Pintor: {painterRecord?.id} · Correo: {currentUser?.correo}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => fetchPainterData()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Citas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citas de Servicio Asignadas (Tabla CitasServicio filtrada por pintor_id) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0033A0]" />
              Obras y Citas Asignadas (Tabla CitasServicio)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lectura de <code className="text-[#0033A0] font-mono">CitasServicio</code> donde <code className="text-[#0033A0] font-mono">pintor_id === '{painterRecord?.id}'</code>.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            {citas.length} citas registradas
          </span>
        </div>

        {citas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tienes citas de servicio asignadas en la tabla <code className="text-slate-600 font-mono">CitasServicio</code>.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {citas.map((cita) => {
              const proy = proyectos.find((p) => p.id === cita.proyecto_id);
              const cliente = usuarios.find((u) => u.id === proy?.usuario_id);
              const evaluacion = evaluaciones.find((e) => e.cita_servicio_id === cita.id);

              return (
                <div key={cita.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0033A0]">
                          {proy?.codigo_proyecto || 'PRY-2026'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          (Cita ID: {cita.id})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Fecha de Servicio: <strong className="font-mono">{cita.fecha_servicio.replace('T', ' ')}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cliente: <strong className="text-slate-900">{cliente?.nombre_completo || proy?.usuario_id}</strong></span>
                        <span className="text-[11px] font-mono text-slate-400">({cliente?.correo})</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs sm:text-right shrink-0">
                      <span className="text-slate-400 block text-[11px]">Área de la Obra:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {proy?.area_m2 || 0} m²
                      </span>
                    </div>
                  </div>

                  {/* Estado de la Evaluación de Calidad asociada */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600 font-medium">
                        Garantía (EvaluacionesCalidad):
                      </span>
                      {evaluacion ? (
                        <span className="text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {evaluacion.estado_garantia} (⭐ {evaluacion.calificacion_cliente}/5)
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Pendiente de evaluación del cliente</span>
                      )}
                    </div>

                    {evaluacion?.comentarios_cliente && (
                      <p className="text-[11px] text-slate-600 italic max-w-md truncate">
                        "{evaluacion.comentarios_cliente}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
