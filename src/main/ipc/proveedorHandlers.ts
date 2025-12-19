import { ipcMain } from 'electron';
import { ProveedorService } from '../services/ProveedorService';

const ProveedoreService = new ProveedorService();

export function registerProveedorHandlers() {
  // Obtener todos los productos
  ipcMain.handle('proveedor:getAll', async () => {
    try {
      return await ProveedoreService.getAll();
    } catch (error) {
      console.error('Error en proveedor:getAll', error);
      throw error;
    }
  });

  // Obtener proveedor por ID
  ipcMain.handle('proveedor:getById', async (_, id: number) => {
    try {
      return await ProveedoreService.getById(id);
    } catch (error) {
      console.error('Error en proveedor:getById', error);
      throw error;
    }
  });

  // Crear proveedor
  ipcMain.handle('proveedor:create', async (_, data) => {
    try {
      return await ProveedoreService.create(data);
    } catch (error) {
      console.error('Error en proveedor:create', error);
      throw error;
    }
  });

  // Actualizar proveedor
  ipcMain.handle('proveedor:update', async (_, id: number, data) => {
    try {
      return await ProveedoreService.update(id, data);
    } catch (error) {
      console.error('Error en proveedor:update', error);
      throw error;
    }
  });

  // Eliminar proveedor
  ipcMain.handle('proveedor:delete', async (_, id: number) => {
    try {
      return await ProveedoreService.delete(id);
    } catch (error) {
      console.error('Error en proveedor:delete', error);
      throw error;
    }
  });

  // Buscar proveedors
  ipcMain.handle('proveedor:search', async (_, query: string) => {
    try {
      return await ProveedoreService.searchByName(query);
    } catch (error) {
      console.error('Error en proveedor:search', error);
      throw error;
    }
  });

}