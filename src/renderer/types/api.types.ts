import { Producto, Proveedor } from '@prisma/client';

// Tipos para el frontend
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
    };
  }
}