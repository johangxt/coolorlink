import {
  Usuario,
  TipoEspacio,
  EstadoSuperficie,
  Color,
  Producto,
  Pintor,
  Proyecto,
  CitaServicio,
  EvaluacionCalidad,
  MovimientoInventario,
} from '../types/database';

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'usr_cliente_1',
    nombre_completo: 'Carlos Eduardo Morales',
    rol: 'cliente',
    correo: 'carlos.morales@gmail.com',
  },
  {
    id: 'usr_vendedor_1',
    nombre_completo: 'Mariana Restrepo V.',
    rol: 'vendedor',
    correo: 'm.restrepo@pintuco.com',
  },
  {
    id: 'usr_pintor_1',
    nombre_completo: 'Javier Alonso Gómez',
    rol: 'pintor',
    correo: 'javier.gomez@pintucomaster.com',
  },
  {
    id: 'usr_pintor_2',
    nombre_completo: 'Orlando Sánchez Medina',
    rol: 'pintor',
    correo: 'orlando.sanchez@pintucomaster.com',
  },
  {
    id: 'usr_admin_1',
    nombre_completo: 'Ing. Andrés Botero Cuartas',
    rol: 'admin',
    correo: 'andres.botero@pintuco.com',
  },
];

export const INITIAL_TIPOS_ESPACIO: TipoEspacio[] = [
  {
    id: 'esp_sala',
    nombre: 'Sala / Comedor',
  },
  {
    id: 'esp_habitacion',
    nombre: 'Habitaciones',
  },
  {
    id: 'esp_fachada',
    nombre: 'Fachada Exterior',
  },
  {
    id: 'esp_humedo',
    nombre: 'Cocina & Baños',
  },
  {
    id: 'esp_comercial',
    nombre: 'Local / Oficina Comercial',
  },
  {
    id: 'esp_terraza',
    nombre: 'Terraza / Balcón',
  },
];

export const INITIAL_ESTADOS_SUPERFICIE: EstadoSuperficie[] = [
  {
    id: 'est_lisa_nueva',
    nombre: 'Superficie Nueva en Yeso / Estuco',
    factor_rendimiento: 1.0,
  },
  {
    id: 'est_lisa_existente',
    nombre: 'Superficie Pintada en Buen Estado',
    factor_rendimiento: 0.95,
  },
  {
    id: 'est_fisuras_leves',
    nombre: 'Con Fisuras Superficiales Leves',
    factor_rendimiento: 0.85,
  },
  {
    id: 'est_humedad',
    nombre: 'Con Problemas de Humedad o Salitre',
    factor_rendimiento: 0.75,
  },
  {
    id: 'est_rustica',
    nombre: 'Revoque Rústico / Bloque a la Vista',
    factor_rendimiento: 0.65,
  },
];

export const INITIAL_COLORES: Color[] = [
  {
    id: 'col_azul_pintuco',
    nombre: 'Azul Pintuco Real',
    codigo_hex: '#0033A0',
    coleccion: 'Identidad Corporativa',
    acabado: 'Satinado',
  },
  {
    id: 'col_amarillo_pintuco',
    nombre: 'Amarillo Sol Pintuco',
    codigo_hex: '#FFC72C',
    coleccion: 'Identidad Corporativa',
    acabado: 'Semibrillante',
  },
  {
    id: 'col_blanco_nieve',
    nombre: 'Blanco Puro Ultra Nieve',
    codigo_hex: '#FAFAFA',
    coleccion: 'Clásicos Pintuco',
    acabado: 'Mate',
  },
  {
    id: 'col_gris_urbano',
    nombre: 'Gris Platino Contemporáneo',
    codigo_hex: '#94A3B8',
    coleccion: 'Tendencias 2026',
    acabado: 'Satinado',
  },
  {
    id: 'col_arena_caribe',
    nombre: 'Arena del Caribe',
    codigo_hex: '#E2D4B7',
    coleccion: 'Cálidos Andinos',
    acabado: 'Mate',
  },
  {
    id: 'col_verde_palma',
    nombre: 'Verde Palma Tropical',
    codigo_hex: '#2E6F40',
    coleccion: 'Tendencias 2026',
    acabado: 'Satinado',
  },
  {
    id: 'col_terracota',
    nombre: 'Terracota Colonial',
    codigo_hex: '#A85A3C',
    coleccion: 'Fachadas y Exteriores',
    acabado: 'Mate',
  },
  {
    id: 'col_azul_marino',
    nombre: 'Azul Índigo Profundo',
    codigo_hex: '#1E3A8A',
    coleccion: 'Tendencias 2026',
    acabado: 'Satinado',
  },
  {
    id: 'col_grafito',
    nombre: 'Grafito Arquitectónico',
    codigo_hex: '#334155',
    coleccion: 'Modernos Industriales',
    acabado: 'Mate',
  },
];

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: 'prod_viniltex_avanzado',
    nombre: 'Viniltex Avanzado Antibacterial',
    precio: 94900,
    rendimiento: 30, // 30 m2 por galón a 2 manos
    stock_disponible: 42,
    punto_reorden: 15,
  },
  {
    id: 'prod_koraza_5',
    nombre: 'Koraza 5 Máxima Protección Exterior',
    precio: 128900,
    rendimiento: 25,
    stock_disponible: 9, // Alerta: <= punto_reorden
    punto_reorden: 12,
  },
  {
    id: 'prod_acualux_esmalte',
    nombre: 'Pintulux Acualux Esmalte al Agua',
    precio: 105500,
    rendimiento: 28,
    stock_disponible: 18,
    punto_reorden: 10,
  },
  {
    id: 'prod_intervinil',
    nombre: 'Intervinil Tradicional Tipo 2',
    precio: 62000,
    rendimiento: 22,
    stock_disponible: 5, // Alerta: <= punto_reorden
    punto_reorden: 15,
  },
  {
    id: 'prod_pintucoat_epoxica',
    nombre: 'Pintucoat Epóxica Alto Tráfico',
    precio: 185000,
    rendimiento: 20,
    stock_disponible: 24,
    punto_reorden: 8,
  },
];

export const INITIAL_PINTORES: Pintor[] = [
  {
    id: 'pnt_javier_gomez',
    usuario_id: 'usr_pintor_1',
    certificacion: 'Certificado Pintuco Master Oro #PM-842',
    calificacion_promedio: 4.9,
  },
  {
    id: 'pnt_orlando_sanchez',
    usuario_id: 'usr_pintor_2',
    certificacion: 'Especialista en Fachadas & Airless Pintuco #EF-319',
    calificacion_promedio: 4.8,
  },
];

export const INITIAL_PROYECTOS: Proyecto[] = [
  {
    id: 'pry_001',
    usuario_id: 'usr_cliente_1',
    codigo_proyecto: 'PRY-2026-084',
    area_m2: 85,
    tipo_espacio_id: 'esp_sala',
    estado_superficie_id: 'est_lisa_existente',
    color_id: 'col_gris_urbano',
    producto_id: 'prod_viniltex_avanzado',
    galones_estimados: 3,
  },
  {
    id: 'pry_002',
    usuario_id: 'usr_cliente_1',
    codigo_proyecto: 'PRY-2026-092',
    area_m2: 140,
    tipo_espacio_id: 'esp_fachada',
    estado_superficie_id: 'est_fisuras_leves',
    color_id: 'col_terracota',
    producto_id: 'prod_koraza_5',
    galones_estimados: 7,
  },
  {
    id: 'pry_003',
    usuario_id: 'usr_cliente_1',
    codigo_proyecto: 'PRY-2026-105',
    area_m2: 45,
    tipo_espacio_id: 'esp_habitacion',
    estado_superficie_id: 'est_lisa_nueva',
    color_id: 'col_blanco_nieve',
    producto_id: 'prod_viniltex_avanzado',
    galones_estimados: 2,
  },
];

export const INITIAL_CITAS_SERVICIO: CitaServicio[] = [
  {
    id: 'cita_001',
    proyecto_id: 'pry_001',
    pintor_id: 'pnt_javier_gomez',
    fecha_servicio: '2026-11-08T08:00',
  },
  {
    id: 'cita_002',
    proyecto_id: 'pry_002',
    pintor_id: 'pnt_javier_gomez',
    fecha_servicio: '2026-11-10T07:30',
  },
  {
    id: 'cita_003',
    proyecto_id: 'pry_003',
    pintor_id: 'pnt_orlando_sanchez',
    fecha_servicio: '2026-11-12T08:30',
  },
];

export const INITIAL_EVALUACIONES_CALIDAD: EvaluacionCalidad[] = [
  {
    id: 'eval_001',
    cita_servicio_id: 'cita_001',
    calificacion_cliente: 5,
    comentarios_cliente: 'Excelente acabado, puntualidad y limpieza absoluta al terminar.',
    estado_garantia: 'Sin reclamos',
  },
];

export const INITIAL_MOVIMIENTOS_INVENTARIO: MovimientoInventario[] = [
  {
    id: 'mov_001',
    producto_id: 'prod_viniltex_avanzado',
    tipo_movimiento: 'entrada',
    cantidad: 50,
    fecha_movimiento: '2026-11-01T08:00:00Z',
  },
  {
    id: 'mov_002',
    producto_id: 'prod_viniltex_avanzado',
    tipo_movimiento: 'salida',
    cantidad: 8,
    fecha_movimiento: '2026-11-04T11:00:00Z',
  },
  {
    id: 'mov_003',
    producto_id: 'prod_koraza_5',
    tipo_movimiento: 'salida',
    cantidad: 7,
    fecha_movimiento: '2026-11-05T15:00:00Z',
  },
];
