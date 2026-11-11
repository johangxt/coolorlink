import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, UserRole } from '../types/database';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: Usuario | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (params: {
    nombre_completo: string;
    correo: string;
    password: string;
    rol: UserRole;
  }) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'colorlink_pintuco_logged_user_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize active session with Usuarios table
  const syncUserFromDb = async (emailOrId: string) => {
    try {
      const { data, error } = await supabase.from('Usuarios').select('*');
      if (!error && data) {
        const clean = emailOrId.trim().toLowerCase();
        const found = (data as Usuario[]).find(
          (u) => u.correo.toLowerCase() === clean || u.id === emailOrId
        );
        if (found) {
          setCurrentUser(found);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
          return found;
        }
      }
    } catch (err) {
      console.error('Error synchronizing user from Usuarios table', err);
    }
    return null;
  };

  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      try {
        // Check active Supabase session
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData?.session?.user;

        if (authUser && authUser.email) {
          await syncUserFromDb(authUser.email);
        } else {
          // Check local stored session
          const savedUser = localStorage.getItem(CURRENT_USER_KEY);
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              if (parsed?.correo) {
                await syncUserFromDb(parsed.correo);
              }
            } catch {
              localStorage.removeItem(CURRENT_USER_KEY);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const handleDataChange = () => {
      if (currentUser?.correo) {
        syncUserFromDb(currentUser.correo);
      }
    };

    window.addEventListener('supabase-data-changed', handleDataChange);
    return () => window.removeEventListener('supabase-data-changed', handleDataChange);
  }, []);

  /**
   * Real Supabase Authentication: signInWithPassword
   */
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        return { success: false, message: authError.message || 'Error al autenticar con Supabase' };
      }

      // 2. Validate role in Usuarios table strictly
      const userRecord = await syncUserFromDb(cleanEmail);
      if (!userRecord) {
        // Fallback: If user authenticated in Auth but not yet in Usuarios table, register record
        const userMeta = authData?.user?.user_metadata || {};
        const fallbackUser: Usuario = {
          id: authData?.user?.id || `usr_cliente_${Date.now()}`,
          nombre_completo: userMeta.nombre_completo || 'Usuario Pintuco',
          correo: cleanEmail,
          rol: (userMeta.rol as UserRole) || 'cliente',
        };

        await supabase.from('Usuarios').insert(fallbackUser);
        setCurrentUser(fallbackUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallbackUser));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error inesperado durante el inicio de sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real Supabase Authentication: signUp with Password and Role assignment
   */
  const signUp = async (params: {
    nombre_completo: string;
    correo: string;
    password: string;
    rol: UserRole;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const cleanEmail = params.correo.trim().toLowerCase();

      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            nombre_completo: params.nombre_completo.trim(),
            rol: params.rol,
          },
        },
      });

      if (authError) {
        return { success: false, message: authError.message || 'Error al registrar usuario en Supabase Auth' };
      }

      const assignedId = authData?.user?.id || `usr_${params.rol}_${Date.now()}`;

      // 2. Insert strictly into Usuarios table: id, nombre_completo, rol, correo
      const newUsuario: Usuario = {
        id: assignedId,
        nombre_completo: params.nombre_completo.trim(),
        rol: params.rol,
        correo: cleanEmail,
      };

      const { error: dbError } = await supabase.from('Usuarios').insert(newUsuario);
      if (dbError) {
        console.warn('Advertencia al insertar en tabla Usuarios:', dbError);
      }

      // If registered as pintor, ensure a corresponding record in Pintores exists
      if (params.rol === 'pintor') {
        await supabase.from('Pintores').insert({
          id: `pnt_${Date.now()}`,
          usuario_id: assignedId,
          certificacion: 'Certificado Pintuco Profesional',
          calificacion_promedio: 5.0,
        });
      }

      setCurrentUser(newUsuario);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUsuario));
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error inesperado durante el registro' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real Supabase Sign Out
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setCurrentUser(null);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  const reloadUser = async () => {
    if (currentUser?.correo) {
      await syncUserFromDb(currentUser.correo);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.rol || null,
        isAuthenticated: !!currentUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
