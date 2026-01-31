import { contextBridge, ipcRenderer } from 'electron';

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('api', {
  // Products
  product: {
    getAll: () => ipcRenderer.invoke('product:getAll'),
    getById: (id: number) => ipcRenderer.invoke('product:getById', id),
    create: (data: any) => ipcRenderer.invoke('product:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('product:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('product:delete', id),
    searchByCode: (query: string) => ipcRenderer.invoke('product:searchByCode', query),
    getLowStock: () => ipcRenderer.invoke('product:getLowStock'),
    getByBarcode: (barcode: string) => ipcRenderer.invoke('product:getByBarcode', barcode),
    getByCodigo: (codigo: string) => ipcRenderer.invoke('product:getByCodigo', codigo),
    search: (query: string) => ipcRenderer.invoke('product:search', query),
    findOneByBarcode: (barcode: string) => ipcRenderer.invoke('product:findOneByBarcode', barcode),
  },
  // Suppliers
  supplier: {
    getAll: () => ipcRenderer.invoke('supplier:getAll'),
    getById: (id: number) => ipcRenderer.invoke('supplier:getById', id),
    create: (data: any) => ipcRenderer.invoke('supplier:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('supplier:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('supplier:delete', id),
    search: (query: string) => ipcRenderer.invoke('supplier:search', query),
  },
  // Ventas
  sale: {
    getAll: () => ipcRenderer.invoke('sale:getAll'),
    getById: (id: number) => ipcRenderer.invoke('sale:getById', id),
    create: (data: any) => ipcRenderer.invoke('sale:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('sale:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('sale:delete', id),
  },
  // Purchases
  purchase: {
    getAll: () => ipcRenderer.invoke('purchase:getAll'),
    getById: (id: number) => ipcRenderer.invoke('purchase:getById', id),
    create: (data: any) => ipcRenderer.invoke('purchase:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('purchase:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('purchase:delete', id),
  },
  
  // Agregar otros módulos aquí cuando los implementes
  // venta: { ... },
  // recordatorio: { ... },
});