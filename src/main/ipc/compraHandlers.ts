import { ipcMain } from 'electron';
import { CompraService } from '../services/CompraService';

const PurchaseService = new CompraService();

export function registerCompraHandlers() {
  // Obtener todas las compras
  ipcMain.handle('compra:getAll', async () => {
    try {
      return await PurchaseService.getAll();
    } catch (error) {
      console.error('Error en compra:getAll', error);
      throw error;
    }
  });

  // Obtener compra por ID
  ipcMain.handle('compra:getById', async (_, id: number) => {
    try {
      return await PurchaseService.getById(id);
    } catch (error) {
      console.error('Error en compra:getById', error);
      throw error;
    }
  });

  // Crear compra
  ipcMain.handle('compra:create', async (_, data) => {
    try {
      return await PurchaseService.create(data);
    } catch (error) {
      console.error('Error en compra:create', error);
      throw error;
    }
  });

  // Actualizar compra
  ipcMain.handle('compra:update', async (_, id: number, data) => {
    try {
      return await PurchaseService.update(id, data);
    } catch (error) {
      console.error('Error en compra:update', error);
      throw error;
    }
  });

  // Eliminar compra
  ipcMain.handle('compra:delete', async (_, id: number) => {
    try {
      return await PurchaseService.delete(id);
    } catch (error) {
      console.error('Error en compra:delete', error);
      throw error;
    }
  });

}