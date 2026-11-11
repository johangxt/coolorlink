import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Database, User } from 'lucide-react';
import { isLiveSupabaseConfigured } from '../lib/supabase';

export const Header: React.FC = () => {
  const { currentUser, currentRole, signOut } = useAuth();

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'cliente':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'vendedor':
        return 'bg-blue-100 text-[#0033A0] border-blue-200';
      case 'pintor':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'admin':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark with Pintuco branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#0033A0] flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-lg text-[#FFC72C] tracking-tight">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0033A0] whitespace-nowrap">
            ColorLink <span className="text-slate-900 font-medium">Pintuco</span>
          </span>
        </div>

        {/* Zone 2: Clean single-line connection & role indicators */}
        <nav className="hidden md:flex items-center gap-5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-[#0033A0]" />
            <span>Supabase: {isLiveSupabaseConfigured ? 'Conexión Cloud' : 'Motor Local Persistente'}</span>
          </div>
          {currentRole && (
            <>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className={`px-2 py-0.5 rounded font-semibold capitalize border ${getRoleBadge(currentRole)}`}>
                Rol: {currentRole}
              </span>
            </>
          )}
        </nav>

        {/* Zone 3: User Profile & Real Sign Out */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                  {currentUser.nombre_completo}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">
                  {currentUser.correo}
                </p>
              </div>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                title="Cerrar sesión en Supabase"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-4 h-4 text-slate-400" />
              <span>Sin sesión activa</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
