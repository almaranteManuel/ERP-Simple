import { Producto, Proveedor, Venta, Compra } from '@prisma/client';

// Tipos para el frontend

//PRODUCTOS CON SU PROVEEDOR
export type ProductoConProveedor = Producto & {
  proveedor?: Proveedor | null;
};
export interface CreateProductoDTO {
  codigo: string;
  descripcion?: string;
  precio: number;
  precio_propio?: number;
  stock: number;
  variante?: number;
  proveedorId?: number;
}
export interface UpdateProductoDTO {
  codigo?: string;
  descripcion?: string;
  precio?: number;
  precio_propio?: number;
  stock?: number;
  variante?: number;
  proveedorId?: number;
}
//PROVEEDORES
export type Proveedore = Proveedor;
export interface CreateProveedorDTO {
  nombre: string;
  telefono?: string;
  email: string;
  direccion?: string;
}
export interface UpdateProveedorDTO {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}
//VENTAS CON SU PRODUCTO
export type VentaConProducto = Venta & {
  producto?: Producto | null;
};
export interface CreateVentaDTO {
  fecha: Date;
  total?: number;
  productoId: number;
}
export interface UpdateVentaDTO {
  fecha: Date;
  total?: number;
  productoId: number;
}
//COMPRAS CON SU PROVEEDOR
export type CompraConProveedor = Compra & {
  proveedor?: Proveedor | null;
};
export interface CreateCompraDTO {
  fecha: Date;
  total?: number;
  proveedorId: number;
}
export interface UpdateCompraDTO {
  fecha: Date;
  total?: number;
  proveedorId: number;
}

// Extender el objeto window con tu API
declare global {
  interface Window {
    api: {
      producto: {
        getAll: () => Promise<ProductoConProveedor[]>;
        getById: (id: number) => Promise<ProductoConProveedor | null>;
        create: (data: CreateProductoDTO) => Promise<ProductoConProveedor>;
        update: (id: number, data: UpdateProductoDTO) => Promise<ProductoConProveedor>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<ProductoConProveedor[]>;
        getLowStock: () => Promise<ProductoConProveedor[]>;
      };
      proveedor: {
        getAll: () => Promise<Proveedore[]>;
        getById: (id: number) => Promise<Proveedore | null>;
        create: (data: CreateProveedorDTO) => Promise<Proveedore>;
        update: (id: number, data: UpdateProveedorDTO) => Promise<Proveedore>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<Proveedore[]>;
      };
      venta: {
        getAll: () => Promise<VentaConProducto[]>;
        getById: (id: number) => Promise<VentaConProducto | null>;
        create: (data: CreateVentaDTO) => Promise<VentaConProducto>;
        update: (id: number, data: UpdateVentaDTO) => Promise<VentaConProducto>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<VentaConProducto[]>;
      };
      compra: {
        getAll: () => Promise<CompraConProveedor[]>;
        getById: (id: number) => Promise<CompraConProveedor | null>;
        create: (data: CreateCompraDTO) => Promise<CompraConProveedor>;
        update: (id: number, data: UpdateCompraDTO) => Promise<CompraConProveedor>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<CompraConProveedor[]>;
      };
    };
  }
}