import React from 'react';
import { TipoEspacio, EstadoSuperficie } from '../../types/database';
import { Check, Layers } from 'lucide-react';

interface StepDiagnosticoProps {
  tiposEspacio: TipoEspacio[];
  estadosSuperficie: EstadoSuperficie[];
  selectedEspacioId: string;
  onSelectEspacio: (id: string) => void;
  selectedEstadoSuperficieId: string;
  onSelectEstadoSuperficie: (id: string) => void;
  areaM2: number;
  onChangeAreaM2: (area: number) => void;
}

export const StepDiagnostico: React.FC<StepDiagnosticoProps> = ({
  tiposEspacio,
  estadosSuperficie,
  selectedEspacioId,
  onSelectEspacio,
  selectedEstadoSuperficieId,
  onSelectEstadoSuperficie,
  areaM2,
  onChangeAreaM2,
}) => {
  const selectedEspacio = tiposEspacio.find((e) => e.id === selectedEspacioId);
  const selectedEstado = estadosSuperficie.find((s) => s.id === selectedEstadoSuperficieId);

  return (
    <div className="space-y-8">
      
      {/* 1. Selector de TiposEspacio (Tabla TiposEspacio: id, nombre) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Tipo de Espacio (Tabla TiposEspacio)
            </h3>
            <p className="text-xs text-slate-500">
              Selecciona el ambiente correspondiente registrado en la base de datos.
            </p>
          </div>
          {selectedEspacio && (
            <span className="text-xs font-semibold text-[#0033A0] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {selectedEspacio.nombre}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiposEspacio.map((espacio) => {
            const isSelected = espacio.id === selectedEspacioId;
            return (
              <button
                key={espacio.id}
                type="button"
                onClick={() => onSelectEspacio(espacio.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0033A0] bg-blue-50/70 shadow-sm ring-1 ring-[#0033A0]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0033A0] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-[#0033A0] text-[#FFC72C]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {espacio.nombre}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {espacio.id}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector de EstadosSuperficie (id, nombre, factor_rendimiento) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              2. Estado de la Superficie (Tabla EstadosSuperficie)
            </h3>
            <p className="text-xs text-slate-500">
              Afecta directamente el factor de rendimiento técnico de la pintura.
            </p>
          </div>
          {selectedEstado && (
            <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Factor Rendimiento: {(selectedEstado.factor_rendimiento * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {estadosSuperficie.map((estado) => {
            const isSelected = estado.id === selectedEstadoSuperficieId;
            return (
              <button
                key={estado.id}
                type="button"
                onClick={() => onSelectEstadoSuperficie(estado.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-[#0033A0] bg-blue-50/70 shadow-sm ring-1 ring-[#0033A0]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900 block mb-1">
                      {estado.nombre}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Factor: {estado.factor_rendimiento} · ID: {estado.id}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0033A0] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Slider de Área en m² (Proyectos.area_m2) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3. Metraje Total (Proyectos.area_m2)
            </h3>
            <p className="text-xs text-slate-500">
              Define los metros cuadrados exactos a registrar en la tabla <code className="text-[#0033A0] font-mono">Proyectos</code>.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-[#0033A0] text-white px-4 py-2 rounded-xl shrink-0 shadow-sm">
            <span className="text-2xl font-extrabold font-mono text-[#FFC72C] tabular-nums">
              {areaM2}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">m²</span>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min={5}
            max={400}
            step={5}
            value={areaM2}
            onChange={(e) => onChangeAreaM2(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0033A0]"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>5 m²</span>
            <span>100 m²</span>
            <span>200 m²</span>
            <span>400 m²</span>
          </div>
        </div>
      </div>

    </div>
  );
};
