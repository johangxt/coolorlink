export type UserRole = 'cliente' | 'vendedor' | 'pintor' | 'admin';

export interface Usuario {
  id: string;
  nombre_completo: string;
  rol: UserRole;
  correo: string;
}

export interface Proyecto {
  id: string;
  usuario_id: string;
  codigo_proyecto: string;
  area_m2: number;
  // Campos de contexto guardados para la cotización
  tipo_espacio_id?: string;
  estado_superficie_id?: string;
  color_id?: string;
  producto_id?: string;
  galones_estimados?: number;
}

export interface TipoEspacio {
  id: string;
  nombre: string;
}

export interface EstadoSuperficie {
  id: string;
  nombre: string;
  factor_rendimiento: number;
}

export interface Color {
  id: string;
  nombre: string;
  codigo_hex: string;
  coleccion: string;
  acabado: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  rendimiento: number; // m2 por galón a 2 manos
  stock_disponible: number;
  punto_reorden: number;
}

export interface MovimientoInventario {
  id: string;
  producto_id: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | string;
  cantidad: number;
  fecha_movimiento: string;
}

export interface Pintor {
  id: string;
  usuario_id: string;
  certificacion: string;
  calificacion_promedio: number;
}

export interface CitaServicio {
  id: string;
  proyecto_id: string;
  pintor_id: string;
  fecha_servicio: string;
}

export interface EvaluacionCalidad {
  id: string;
  cita_servicio_id: string;
  calificacion_cliente: number; // 1 a 5
  comentarios_cliente: string;
  estado_garantia: string; // Inicializado en 'Sin reclamos'
}
