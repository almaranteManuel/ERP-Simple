// Cliente para usar en React
export const productoApi = {
  getAll: () => window.api.producto.getAll(),
  getById: (id: number) => window.api.producto.getById(id),
  create: (data: any) => window.api.producto.create(data),
  update: (id: number, data: any) => window.api.producto.update(id, data),
  delete: (id: number) => window.api.producto.delete(id),
  search: (query: string) => window.api.producto.search(query),
  getLowStock: () => window.api.producto.getLowStock(),
};

export const proveedorApi = {
  getAll: () => window.api.proveedor.getAll(),
  getById: (id: number) => window.api.proveedor.getById(id),
  create: (data: any) => window.api.proveedor.create(data),
  update: (id: number, data: any) => window.api.proveedor.update(id, data),
  delete: (id: number) => window.api.proveedor.delete(id),
  search: (query: string) => window.api.proveedor.search(query),
};

// Exportar otros módulos cuando los implementes
// export const proveedorApi = { ... };
// export const compraApi = { ... };