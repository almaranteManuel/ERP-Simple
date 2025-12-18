import { Producto, Proveedor } from '@prisma/client';

// Tipos para el frontend
export type ProductoConProveedor = Producto & {
  proveedor?: Proveedor | null;
};

export interface CreateProductoDTO {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedorId?: number;
}

export interface UpdateProductoDTO {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  stockMinimo?: number;
  proveedorId?: number;
}

// Extender el objeto window con tu API
declare global {
  interface Window {
    api: {
      producto: {
        getAll: () => Promise<ProductoConProveedor[]>;
        getById: (id: number) => Promise<ProductoConProveedor | null>;
        create: (data: CreateProductoDTO) => Promise<Producto>;
        update: (id: number, data: UpdateProductoDTO) => Promise<Producto>;
        delete: (id: number) => Promise<Producto>;
        search: (query: string) => Promise<Producto>;
        getLowStock: () => Promise<Producto>;
      };
    };
  }
}