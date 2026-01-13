// src/renderer/types/api.types.ts
import { Producto, Proveedor, Venta, Compra, VentaItem, CompraItem } from '@prisma/client';

// ============================================================================
// TIPOS BASE CON RELACIONES (para queries con include)
// ============================================================================

// PRODUCTOS
export type ProductoCompleto = Producto & {
  proveedor?: Proveedor | null;
  ventaItems?: VentaItem[];
  compraItems?: CompraItem[];
};

// Para el frontend, normalmente solo necesitas el producto con su proveedor
export type ProductoConProveedor = Producto & {
  proveedor?: Proveedor | null;
};

// PROVEEDORES
export type ProveedorCompleto = Proveedor & {
  productos?: Producto[];
  compras?: Compra[];
};

// ============================================================================
// DTOs PARA PRODUCTOS
// ============================================================================

export interface CreateProductoDTO {
  nombre: string;
  descripcion?: string;
  codigo?: string;
  codigoBarras?: string;
  precio: number;
  stock?: number;
  stockMinimo?: number;
  categoria?: string;
  imagen?: string;
  activo?: boolean;
  variante?: number;
  proveedorId?: number;
}

export interface UpdateProductoDTO {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  codigoBarras?: string;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  categoria?: string;
  imagen?: string;
  activo?: boolean;
  variante?: number;
  proveedorId?: number;
}

// ============================================================================
// DTOs PARA PROVEEDORES
// ============================================================================

export interface CreateProveedorDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdateProveedorDTO {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

// ============================================================================
// VENTAS
// ============================================================================

export type VentaCompleta = Venta & {
  items: (VentaItem & {
    producto: Producto;
  })[];
};

export interface VentaItemInput {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento?: number;
}

export interface CreateVentaDTO {
  items: VentaItemInput[];
  subtotal: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  metodoPago?: string;
  observaciones?: string;
}

export interface UpdateVentaDTO {
  metodoPago?: string;
  observaciones?: string;
  estado?: string;
}

export interface VentaEstadisticas {
  totalVentas: number;
  montoTotal: number;
  totalItems: number;
  promedioVenta: number;
  metodosPago: Record<string, number>;
}

export interface ProductoMasVendido {
  producto: Producto;
  totalVendido: number;
  ingresos: number;
}

// ============================================================================
// COMPRAS
// ============================================================================

export type CompraCompleta = Compra & {
  proveedor: Proveedor;
  items: (CompraItem & {
    producto: Producto;
  })[];
};

export interface CompraItemInput {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento?: number;
}

export interface CreateCompraDTO {
  proveedorId: number;
  items: CompraItemInput[];
  subtotal: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  observaciones?: string;
}

export interface UpdateCompraDTO {
  observaciones?: string;
  estado?: string;
}

export interface CompraEstadisticas {
  totalCompras: number;
  montoTotal: number;
  totalItems: number;
  promedioCompra: number;
}

// ============================================================================
// WINDOW API - Declaración global
// ============================================================================

declare global {
  interface Window {
    api: {
      // PRODUCTOS
      producto: {
        getAll: () => Promise<ProductoConProveedor[]>;
        getById: (id: number) => Promise<ProductoConProveedor | null>;
        getByBarcode: (barcode: string) => Promise<ProductoConProveedor | null>;
        getByCodigo: (codigo: string) => Promise<ProductoConProveedor | null>;
        getStockBajo: () => Promise<ProductoConProveedor[]>;
        create: (data: CreateProductoDTO) => Promise<ProductoConProveedor>;
        update: (id: number, data: UpdateProductoDTO) => Promise<ProductoConProveedor>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<ProductoConProveedor[]>;
      };

      // PROVEEDORES
      proveedor: {
        getAll: () => Promise<Proveedor[]>;
        getById: (id: number) => Promise<Proveedor | null>;
        create: (data: CreateProveedorDTO) => Promise<Proveedor>;
        update: (id: number, data: UpdateProveedorDTO) => Promise<Proveedor>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<Proveedor[]>;
      };

      // VENTAS
      venta: {
        getAll: () => Promise<VentaCompleta[]>;
        getById: (id: number) => Promise<VentaCompleta | null>;
        getVentasHoy: () => Promise<VentaCompleta[]>;
        getByDateRange: (fechaInicio: Date, fechaFin: Date) => Promise<VentaCompleta[]>;
        create: (data: CreateVentaDTO) => Promise<VentaCompleta>;
        update: (id: number, data: UpdateVentaDTO) => Promise<VentaCompleta>;
        anular: (id: number) => Promise<VentaCompleta>;
        delete: (id: number) => Promise<void>;
        getEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<VentaEstadisticas>;
        getProductosMasVendidos: (
          limite?: number,
          fechaInicio?: Date,
          fechaFin?: Date
        ) => Promise<ProductoMasVendido[]>;
      };

      // COMPRAS
      compra: {
        getAll: () => Promise<CompraCompleta[]>;
        getById: (id: number) => Promise<CompraCompleta | null>;
        getByProveedor: (proveedorId: number) => Promise<CompraCompleta[]>;
        create: (data: CreateCompraDTO) => Promise<CompraCompleta>;
        update: (id: number, data: UpdateCompraDTO) => Promise<CompraCompleta>;
        anular: (id: number) => Promise<CompraCompleta>;
        delete: (id: number) => Promise<void>;
        getEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<CompraEstadisticas>;
      };
    };
  }
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface DateRange {
  fechaInicio: Date;
  fechaFin: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoVenta {
  COMPLETADA = 'completada',
  ANULADA = 'anulada',
  PENDIENTE = 'pendiente',
}

export enum EstadoCompra {
  COMPLETADA = 'completada',
  ANULADA = 'anulada',
  PENDIENTE = 'pendiente',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  DEBITO = 'debito',
  CREDITO = 'credito',
}

// ============================================================================
// RE-EXPORTS de Prisma (para conveniencia)
// ============================================================================

export type { Producto, Proveedor, Venta, Compra, VentaItem, CompraItem };