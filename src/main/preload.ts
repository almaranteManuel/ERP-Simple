import { contextBridge, ipcRenderer } from 'electron';

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('api', {
  // Productos
  producto: {
    getAll: () => ipcRenderer.invoke('producto:getAll'),
    getById: (id: number) => ipcRenderer.invoke('producto:getById', id),
    create: (data: any) => ipcRenderer.invoke('producto:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('producto:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('producto:delete', id),
    search: (query: string) => ipcRenderer.invoke('producto:search', query),
    getLowStock: () => ipcRenderer.invoke('producto:getLowStock'),
  },
  
  // Agregar otros módulos aquí cuando los implementes
  // proveedor: { ... },
  // compra: { ... },
  // venta: { ... },
  // recordatorio: { ... },
});