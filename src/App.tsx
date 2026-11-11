/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { ClientWizard } from './components/cliente/ClientWizard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PainterUberView } from './components/pintor/PainterUberView';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { currentRole, isAuthenticated, isLoading } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0033A0] flex items-center justify-center mx-auto shadow-md border-2 border-[#FFC72C] animate-pulse">
            <span className="font-extrabold text-2xl text-[#FFC72C]">P</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">
            Conectando con Supabase...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Header with brand and authenticated profile */}
      <Header />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main View Dispatcher according strictly to authenticated Usuarios.rol */}
      <main className="flex-1">
        {!isAuthenticated ? (
          <LoginView onSuccess={() => showToast('Sesión validada exitosamente')} />
        ) : currentRole === 'cliente' ? (
          <ClientWizard />
        ) : currentRole === 'vendedor' || currentRole === 'admin' ? (
          <AdminDashboard />
        ) : currentRole === 'pintor' ? (
          <PainterUberView />
        ) : (
          <div className="max-w-md mx-auto py-20 text-center">
            <p className="text-sm text-slate-600">Rol no reconocido: {currentRole}</p>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0033A0]">ColorLink Pintuco</span>
            <span>·</span>
            <span>Esquema estricto Supabase © 2026</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Tablas Vinculadas: 10</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Garantía Pintuco
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
