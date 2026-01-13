// Cliente para usar en React
export const productoApi = {
  getAll: () => window.api.producto.getAll(),
  getById: (id: number) => window.api.producto.getById(id),
  create: (data: any) => window.api.producto.create(data),
  update: (id: number, data: any) => window.api.producto.update(id, data),
  delete: (id: number) => window.api.producto.delete(id),
  getLowStock: () => window.api.producto.getStockBajo(),
  getByBarcode: (barcode: string) => window.api.producto.getByBarcode(barcode),
  getByCodigo: (codigo: string) => window.api.producto.getByCodigo(codigo),
  search: (query: string) => window.api.producto.search(query),
};

export const proveedorApi = {
  getAll: () => window.api.proveedor.getAll(),
  getById: (id: number) => window.api.proveedor.getById(id),
  create: (data: any) => window.api.proveedor.create(data),
  update: (id: number, data: any) => window.api.proveedor.update(id, data),
  delete: (id: number) => window.api.proveedor.delete(id),
  search: (query: string) => window.api.proveedor.search(query),
};

export const ventaApi = {
  getAll: () => window.api.venta.getAll(),
  getById: (id: number) => window.api.venta.getById(id),
  create: (data: any) => window.api.venta.create(data),
  update: (id: number, data: any) => window.api.venta.update(id, data),
  delete: (id: number) => window.api.venta.delete(id),
};

export const compraApi = {
  getAll: () => window.api.compra.getAll(),
  getById: (id: number) => window.api.compra.getById(id),
  create: (data: any) => window.api.compra.create(data),
  update: (id: number, data: any) => window.api.compra.update(id, data),
  delete: (id: number) => window.api.compra.delete(id),
};

// Exportar otros módulos cuando los implementes
// export const proveedorApi = { ... };
// export const compraApi = { ... };