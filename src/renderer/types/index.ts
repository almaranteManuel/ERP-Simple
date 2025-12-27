// types/index.ts
export interface Producto {
  id: number;
  codigo: string;
  descripcion: string | null;
  precio: number;
  precio_propio: number;
  stock: number;
  variante: number;
  proveedorId: number | null;
  proveedor?: Proveedor;
  createdAt: Date; 
  updatedAt: Date;
}

export interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  productos?: Producto[];
  createdAt: Date; 
  updatedAt: Date;
}

export interface Venta {
  id: number;
  fecha: Date;
  total?: number;
  productoId: number;
  producto?: Producto;
  createdAt: Date; 
  updatedAt: Date;
}

export interface Compra {
  id: number;
  fecha: Date;
  total?: number;
  proveedorId: number;
  proveedor?: Proveedor;
  createdAt: Date; 
  updatedAt: Date;
}