import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_USUARIOS,
  INITIAL_TIPOS_ESPACIO,
  INITIAL_ESTADOS_SUPERFICIE,
  INITIAL_COLORES,
  INITIAL_PRODUCTOS,
  INITIAL_PINTORES,
  INITIAL_PROYECTOS,
  INITIAL_CITAS_SERVICIO,
  INITIAL_EVALUACIONES_CALIDAD,
  INITIAL_MOVIMIENTOS_INVENTARIO,
} from './mockData';

// Check for live Supabase env variables if user configured them
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Real client instance (if configured)
export const realSupabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for persistent interactive state
const DB_STORAGE_KEY = 'colorlink_pintuco_db_state_v2';
const AUTH_CREDENTIALS_KEY = 'colorlink_pintuco_auth_credentials_v2';
const AUTH_SESSION_KEY = 'colorlink_pintuco_auth_session_v2';

type DatabaseStore = {
  Usuarios: any[];
  Proyectos: any[];
  TiposEspacio: any[];
  EstadosSuperficie: any[];
  Colores: any[];
  Productos: any[];
  MovimientosInventario: any[];
  Pintores: any[];
  CitasServicio: any[];
  EvaluacionesCalidad: any[];
};

function getInitialStore(): DatabaseStore {
  try {
    const saved = localStorage.getItem(DB_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not read from localStorage, using initial mock data', err);
  }

  return {
    Usuarios: [...INITIAL_USUARIOS],
    Proyectos: [...INITIAL_PROYECTOS],
    TiposEspacio: [...INITIAL_TIPOS_ESPACIO],
    EstadosSuperficie: [...INITIAL_ESTADOS_SUPERFICIE],
    Colores: [...INITIAL_COLORES],
    Productos: [...INITIAL_PRODUCTOS],
    MovimientosInventario: [...INITIAL_MOVIMIENTOS_INVENTARIO],
    Pintores: [...INITIAL_PINTORES],
    CitasServicio: [...INITIAL_CITAS_SERVICIO],
    EvaluacionesCalidad: [...INITIAL_EVALUACIONES_CALIDAD],
  };
}

let memoryDb: DatabaseStore = getInitialStore();

function persistDb() {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(memoryDb));
    window.dispatchEvent(new CustomEvent('supabase-data-changed', { detail: { timestamp: Date.now() } }));
  } catch (err) {
    console.warn('Failed to persist to localStorage', err);
  }
}

export function resetDatabaseToDefaults() {
  memoryDb = {
    Usuarios: [...INITIAL_USUARIOS],
    Proyectos: [...INITIAL_PROYECTOS],
    TiposEspacio: [...INITIAL_TIPOS_ESPACIO],
    EstadosSuperficie: [...INITIAL_ESTADOS_SUPERFICIE],
    Colores: [...INITIAL_COLORES],
    Productos: [...INITIAL_PRODUCTOS],
    MovimientosInventario: [...INITIAL_MOVIMIENTOS_INVENTARIO],
    Pintores: [...INITIAL_PINTORES],
    CitasServicio: [...INITIAL_CITAS_SERVICIO],
    EvaluacionesCalidad: [...INITIAL_EVALUACIONES_CALIDAD],
  };
  persistDb();
}

// Credentials repository for local Auth engine
function getStoredCredentials(): Record<string, string> {
  try {
    const saved = localStorage.getItem(AUTH_CREDENTIALS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  // Default password for pre-seeded users
  return {
    'carlos.morales@gmail.com': 'Pintuco2026*',
    'm.restrepo@pintuco.com': 'Pintuco2026*',
    'javier.gomez@pintucomaster.com': 'Pintuco2026*',
    'orlando.sanchez@pintucomaster.com': 'Pintuco2026*',
    'andres.botero@pintuco.com': 'Pintuco2026*',
  };
}

function saveCredentials(creds: Record<string, string>) {
  try {
    localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch {}
}

/**
 * High-fidelity QueryBuilder implementation conforming strictly to Supabase API
 * e.g., supabase.from('Proyectos').insert([...])
 *       supabase.from('Productos').update({...}).eq('id', ...)
 *       supabase.from('CitasServicio').select('*').eq('pintor_id', ...)
 */
class MockQueryBuilder {
  private tableName: keyof DatabaseStore;
  private filters: Array<(row: any) => boolean> = [];
  private selectedColumns: string = '*';
  private sortField?: string;
  private sortAscending: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private updateValues?: Record<string, any>;
  private isDeleteAction: boolean = false;

  constructor(tableName: keyof DatabaseStore) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    this.selectedColumns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row: any) => row[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row: any) => row[column] !== value);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.sortField = column;
    this.sortAscending = options.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  update(values: Record<string, any>) {
    this.updateValues = values;
    return this;
  }

  delete() {
    this.isDeleteAction = true;
    return this;
  }

  async insert(data: any | any[]): Promise<{ data: any; error: any }> {
    const table = memoryDb[this.tableName];
    if (!table) {
      return { data: null, error: new Error(`Table ${this.tableName} does not exist`) };
    }

    const itemsToInsert = Array.isArray(data) ? data : [data];
    const insertedItems: any[] = [];

    for (const item of itemsToInsert) {
      const newItem: any = {
        id: item.id || `${this.tableName.toLowerCase().slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...item,
      };

      // Special automatic business handling for inventory movements
      if (this.tableName === 'MovimientosInventario') {
        if (!newItem.fecha_movimiento) {
          newItem.fecha_movimiento = new Date().toISOString();
        }
        const prodId = newItem.producto_id;
        const targetProd = memoryDb.Productos.find((p) => p.id === prodId);
        if (targetProd) {
          if (newItem.tipo_movimiento === 'salida' || newItem.tipo_movimiento === 'reserva_proyecto') {
            targetProd.stock_disponible = Math.max(0, targetProd.stock_disponible - Number(newItem.cantidad || 0));
          } else if (newItem.tipo_movimiento === 'entrada') {
            targetProd.stock_disponible += Number(newItem.cantidad || 0);
          }
        }
      }

      // Default estado_garantia strictly to 'Sin reclamos' if not provided
      if (this.tableName === 'EvaluacionesCalidad') {
        if (!newItem.estado_garantia) {
          newItem.estado_garantia = 'Sin reclamos';
        }
      }

      table.unshift(newItem);
      insertedItems.push(newItem);
    }

    persistDb();
    return { data: Array.isArray(data) ? insertedItems : insertedItems[0], error: null };
  }

  private async execute(): Promise<{ data: any; error: any }> {
    const table = memoryDb[this.tableName];
    if (!table) {
      return { data: null, error: new Error(`Table ${this.tableName} does not exist`) };
    }

    // Handle updates
    if (this.updateValues) {
      const updatedItems: any[] = [];
      for (let i = 0; i < table.length; i++) {
        const row = table[i];
        const matches = this.filters.every((fn) => fn(row));
        if (matches) {
          table[i] = { ...row, ...this.updateValues };
          updatedItems.push(table[i]);
        }
      }
      persistDb();
      return { data: updatedItems, error: null };
    }

    // Handle deletions
    if (this.isDeleteAction) {
      const deleted: any[] = [];
      memoryDb[this.tableName] = table.filter((row: any) => {
        const matches = this.filters.every((fn) => fn(row));
        if (matches) {
          deleted.push(row);
          return false;
        }
        return true;
      });
      persistDb();
      return { data: deleted, error: null };
    }

    let result = [...table];

    // Apply all .eq() / .neq() filters
    for (const filterFn of this.filters) {
      result = result.filter(filterFn);
    }

    // Apply sorting
    if (this.sortField) {
      const field = this.sortField;
      result.sort((a, b) => {
        if (a[field] < b[field]) return this.sortAscending ? -1 : 1;
        if (a[field] > b[field]) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  // Support direct `then()` so `await supabase.from(...).select(...)` works seamlessly
  then(onfulfilled?: (value: { data: any; error: any }) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

/**
 * Universal supabase client export.
 * Includes complete supabase.auth implementation matching:
 * - supabase.auth.signInWithPassword({ email, password })
 * - supabase.auth.signUp({ email, password, options })
 * - supabase.auth.signOut()
 */
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      if (isLiveSupabaseConfigured && realSupabase) {
        return realSupabase.auth.signInWithPassword({ email, password: password || '' });
      }

      // Local engine auth validation
      const cleanEmail = email.trim().toLowerCase();
      const users = memoryDb.Usuarios;
      const matched = users.find((u) => u.correo.toLowerCase() === cleanEmail);

      if (!matched) {
        return {
          data: { user: null, session: null },
          error: new Error(`Usuario no registrado en la base de datos (${cleanEmail})`),
        };
      }

      const creds = getStoredCredentials();
      const storedPass = creds[cleanEmail];

      if (storedPass && password && storedPass !== password) {
        return {
          data: { user: null, session: null },
          error: new Error('Contraseña incorrecta. Por favor verifica tus credenciales.'),
        };
      }

      const session = {
        access_token: `token_${Date.now()}`,
        user: {
          id: matched.id,
          email: matched.correo,
          user_metadata: {
            nombre_completo: matched.nombre_completo,
            rol: matched.rol,
          },
        },
      };

      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } catch {}

      return { data: session, error: null };
    },

    signUp: async ({
      email,
      password,
      options,
    }: {
      email: string;
      password?: string;
      options?: { data?: Record<string, any> };
    }) => {
      if (isLiveSupabaseConfigured && realSupabase) {
        return realSupabase.auth.signUp({ email, password: password || '', options });
      }

      const cleanEmail = email.trim().toLowerCase();
      const users = memoryDb.Usuarios;
      const existing = users.find((u) => u.correo.toLowerCase() === cleanEmail);

      if (existing) {
        return {
          data: { user: null, session: null },
          error: new Error(`El correo ${cleanEmail} ya se encuentra registrado.`),
        };
      }

      if (password) {
        const creds = getStoredCredentials();
        creds[cleanEmail] = password;
        saveCredentials(creds);
      }

      const newUserId = `usr_${options?.data?.rol || 'cliente'}_${Date.now()}`;
      const user = {
        id: newUserId,
        email: cleanEmail,
        user_metadata: {
          nombre_completo: options?.data?.nombre_completo || 'Usuario Pintuco',
          rol: options?.data?.rol || 'cliente',
        },
      };

      const session = {
        access_token: `token_${Date.now()}`,
        user,
      };

      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } catch {}

      return { data: { user, session }, error: null };
    },

    signOut: async () => {
      if (isLiveSupabaseConfigured && realSupabase) {
        return realSupabase.auth.signOut();
      }
      try {
        localStorage.removeItem(AUTH_SESSION_KEY);
      } catch {}
      return { error: null };
    },

    getSession: async () => {
      if (isLiveSupabaseConfigured && realSupabase) {
        return realSupabase.auth.getSession();
      }
      try {
        const saved = localStorage.getItem(AUTH_SESSION_KEY);
        if (saved) return { data: { session: JSON.parse(saved) }, error: null };
      } catch {}
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      if (isLiveSupabaseConfigured && realSupabase) {
        return realSupabase.auth.getUser();
      }
      try {
        const saved = localStorage.getItem(AUTH_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { data: { user: parsed.user }, error: null };
        }
      } catch {}
      return { data: { user: null }, error: null };
    },
  },

  from: (tableName: string): any => {
    if (isLiveSupabaseConfigured && realSupabase) {
      return realSupabase.from(tableName);
    }
    return new MockQueryBuilder(tableName as keyof DatabaseStore);
  },

  channel: (channelName: string): any => {
    if (isLiveSupabaseConfigured && realSupabase) {
      return realSupabase.channel(channelName);
    }
    return {
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    };
  },
};
