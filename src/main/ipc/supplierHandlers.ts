import { ipcMain } from 'electron';
import { SupplierService } from '../services/SupplierService';

const SuppliereService = new SupplierService();

export function registerSupplierHandlers() {
  // Obtener todos los products
  ipcMain.handle('supplier:getAll', async () => {
    try {
      return await SuppliereService.getAll();
    } catch (error) {
      console.error('Error en supplier:getAll', error);
      throw error;
    }
  });

  // Obtener supplier por ID
  ipcMain.handle('supplier:getById', async (_, id: number) => {
    try {
      return await SuppliereService.getById(id);
    } catch (error) {
      console.error('Error en supplier:getById', error);
      throw error;
    }
  });

  // Crear supplier
  ipcMain.handle('supplier:create', async (_, data) => {
    try {
      return await SuppliereService.create(data);
    } catch (error) {
      console.error('Error en supplier:create', error);
      throw error;
    }
  });

  // Actualizar supplier
  ipcMain.handle('supplier:update', async (_, id: number, data) => {
    try {
      return await SuppliereService.update(id, data);
    } catch (error) {
      console.error('Error en supplier:update', error);
      throw error;
    }
  });

  // Eliminar supplier
  ipcMain.handle('supplier:delete', async (_, id: number) => {
    try {
      return await SuppliereService.delete(id);
    } catch (error) {
      console.error('Error en supplier:delete', error);
      throw error;
    }
  });

  // Buscar suppliers
  ipcMain.handle('supplier:search', async (_, query: string) => {
    try {
      return await SuppliereService.searchByName(query);
    } catch (error) {
      console.error('Error en supplier:search', error);
      throw error;
    }
  });

}