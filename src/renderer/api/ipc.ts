// Cliente para usar en React
export const productApi = {
  getAll: () => window.api.product.getAll(),
  getById: (id: number) => window.api.product.getById(id),
  create: (data: any) => window.api.product.create(data),
  update: (id: number, data: any) => window.api.product.update(id, data),
  delete: (id: number) => window.api.product.delete(id),
  getLowStock: () => window.api.product.getStockSlow(),
  getByBarcode: (barcode: string) => window.api.product.getByBarcode(barcode),
  getByCodigo: (codigo: string) => window.api.product.getByCode(codigo),
  search: (query: string) => window.api.product.search(query),
  findOneByBarcode: (barcode: string) => window.api.product.getByBarcode(barcode),
};

export const supplierApi = {
  getAll: () => window.api.supplier.getAll(),
  getById: (id: number) => window.api.supplier.getById(id),
  create: (data: any) => window.api.supplier.create(data),
  update: (id: number, data: any) => window.api.supplier.update(id, data),
  delete: (id: number) => window.api.supplier.delete(id),
  search: (query: string) => window.api.supplier.search(query),
};

export const ventaApi = {
  getAll: () => window.api.sale.getAll(),
  getById: (id: number) => window.api.sale.getById(id),
  create: (data: any) => window.api.sale.create(data),
  update: (id: number, data: any) => window.api.sale.update(id, data),
  delete: (id: number) => window.api.sale.delete(id),
};

export const purchaseApi = {
  getAll: () => window.api.purchase.getAll(),
  getById: (id: number) => window.api.purchase.getById(id),
  create: (data: any) => window.api.purchase.create(data),
  update: (id: number, data: any) => window.api.purchase.update(id, data),
  delete: (id: number) => window.api.purchase.delete(id),
};

// Exportar otros módulos cuando los implementes