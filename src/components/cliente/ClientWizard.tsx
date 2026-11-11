import React, { useState, useEffect } from 'react';
import {
  TipoEspacio,
  EstadoSuperficie,
  Color,
  Producto,
  Pintor,
} from '../../types/database';
import { supabase } from '../../lib/supabase';
import { StepDiagnostico } from './StepDiagnostico';
import { StepSolucionTecnica } from './StepSolucionTecnica';
import { StepPedidoServicio } from './StepPedidoServicio';
import { StepGarantiaCertificado } from './StepGarantiaCertificado';
import { Check, ChevronRight, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const ClientWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Master tables data
  const [tiposEspacio, setTiposEspacio] = useState<TipoEspacio[]>([]);
  const [estadosSuperficie, setEstadosSuperficie] = useState<EstadoSuperficie[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pintores, setPintores] = useState<Pintor[]>([]);

  // Wizard selections
  const [selectedEspacioId, setSelectedEspacioId] = useState<string>('');
  const [selectedEstadoSuperficieId, setSelectedEstadoSuperficieId] = useState<string>('');
  const [areaM2, setAreaM2] = useState<number>(60);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedProductoId, setSelectedProductoId] = useState<string>('');

  // Project confirmation result state
  const [createdProject, setCreatedProject] = useState<{
    proyectoId: string;
    codigoProyecto: string;
    citaId: string;
    pintorId: string;
    fechaServicio: string;
  } | null>(null);

  // Load master data strictly from Supabase tables
  useEffect(() => {
    const loadMasterData = async () => {
      setIsLoading(true);
      try {
        const [
          { data: dataEspacios },
          { data: dataSuperficies },
          { data: dataColores },
          { data: dataProductos },
          { data: dataPintores },
        ] = await Promise.all([
          supabase.from('TiposEspacio').select('*'),
          supabase.from('EstadosSuperficie').select('*'),
          supabase.from('Colores').select('*'),
          supabase.from('Productos').select('*'),
          supabase.from('Pintores').select('*'),
        ]);

        if (dataEspacios && dataEspacios.length > 0) {
          setTiposEspacio(dataEspacios);
          setSelectedEspacioId(dataEspacios[0].id);
        }
        if (dataSuperficies && dataSuperficies.length > 0) {
          setEstadosSuperficie(dataSuperficies);
          setSelectedEstadoSuperficieId(dataSuperficies[0].id);
        }
        if (dataColores && dataColores.length > 0) {
          setColores(dataColores);
          setSelectedColorId(dataColores[0].id);
        }
        if (dataProductos && dataProductos.length > 0) {
          setProductos(dataProductos);
          setSelectedProductoId(dataProductos[0].id);
        }
        if (dataPintores && dataPintores.length > 0) {
          setPintores(dataPintores);
        }
      } catch (err) {
        console.error('Error loading master tables from Supabase', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMasterData();
  }, []);

  const steps = [
    { number: 1, title: 'Diagnóstico', subtitle: 'Espacio y Muro' },
    { number: 2, title: 'Solución Técnica', subtitle: 'Color y Pintura' },
    { number: 3, title: 'Pedido y Servicio', subtitle: 'Pintor y Cita' },
    { number: 4, title: 'Garantía', subtitle: 'Certificado Oficial' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProjectCreated = (projectData: {
    proyectoId: string;
    codigoProyecto: string;
    citaId: string;
    pintorId: string;
    fechaServicio: string;
  }) => {
    setCreatedProject(projectData);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setCreatedProject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedEstado = estadosSuperficie.find((s) => s.id === selectedEstadoSuperficieId);
  const selectedProducto = productos.find((p) => p.id === selectedProductoId);
  const selectedColor = colores.find((c) => c.id === selectedColorId);
  const selectedEspacio = tiposEspacio.find((e) => e.id === selectedEspacioId);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#0033A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-medium">Cargando catálogo técnico de Pintuco...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#0033A0] bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
          Asistente Inteligente de Pintura
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Configurador de Proyecto ColorLink Pintuco
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Calcula rendimientos, selecciona tu color ideal y agenda pintores certificados con garantía de fábrica.
        </p>
      </div>

      {/* Styled Corporate Progress Bar (4 Etapas) */}
      <div className="mb-10 no-print">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {steps.map((s) => {
            const isCompleted = s.number < currentStep;
            const isCurrent = s.number === currentStep;

            return (
              <div
                key={s.number}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#0033A0] bg-[#0033A0] text-white shadow-md'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-[#FFC72C] text-[#0033A0]'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                  </div>
                  <span
                    className={`text-xs font-bold truncate ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                <span
                  className={`text-[11px] block truncate ml-8 ${
                    isCurrent ? 'text-blue-100' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {s.subtitle}
                </span>
              </div>
            );
          })}
        </div>

        {/* Linear progress track */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#0033A0] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Content by Stage */}
      <div className="min-h-[460px]">
        {currentStep === 1 && (
          <StepDiagnostico
            tiposEspacio={tiposEspacio}
            estadosSuperficie={estadosSuperficie}
            selectedEspacioId={selectedEspacioId}
            onSelectEspacio={setSelectedEspacioId}
            selectedEstadoSuperficieId={selectedEstadoSuperficieId}
            onSelectEstadoSuperficie={setSelectedEstadoSuperficieId}
            areaM2={areaM2}
            onChangeAreaM2={setAreaM2}
          />
        )}

        {currentStep === 2 && (
          <StepSolucionTecnica
            colores={colores}
            productos={productos}
            selectedColorId={selectedColorId}
            onSelectColor={setSelectedColorId}
            selectedProductoId={selectedProductoId}
            onSelectProducto={setSelectedProductoId}
            areaM2={areaM2}
            estadoSuperficie={selectedEstado}
          />
        )}

        {currentStep === 3 && (
          <StepPedidoServicio
            pintores={pintores}
            selectedProducto={selectedProducto}
            selectedColor={selectedColor}
            selectedEspacio={selectedEspacio}
            selectedEstadoSuperficie={selectedEstado}
            areaM2={areaM2}
            onProjectCreated={handleProjectCreated}
          />
        )}

        {currentStep === 4 && (
          <StepGarantiaCertificado
            proyectoId={createdProject?.proyectoId || 'pry_001'}
            codigoProyecto={createdProject?.codigoProyecto || 'PRY-2026-084'}
            citaId={createdProject?.citaId || 'cita_001'}
            pintorId={createdProject?.pintorId || 'pnt_javier_gomez'}
            onResetWizard={handleResetWizard}
          />
        )}
      </div>

      {/* Wizard Step Navigation Footer (for Steps 1 & 2) */}
      {currentStep < 3 && (
        <div className="no-print mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Paso Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-[#0033A0] hover:bg-[#002575] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span>Continuar a {steps[currentStep].title}</span>
            <ChevronRight className="w-4 h-4 text-[#FFC72C]" />
          </button>
        </div>
      )}

    </div>
  );
};
