import { ipcMain } from 'electron';
import { PurchaseService } from '../services/PurchaseService';

const PurchaseServices = new PurchaseService();

export function registerPurchaseHandlers() {
  // Obtener todas las compras
  ipcMain.handle('purchase:getAll', async () => {
    try {
      return await PurchaseServices.getAll();
    } catch (error) {
      console.error('Error en purchase:getAll', error);
      throw error;
    }
  });

  // Obtener compra por ID
  ipcMain.handle('purchase:getById', async (_, id: number) => {
    try {
      return await PurchaseServices.getById(id);
    } catch (error) {
      console.error('Error en purchase:getById', error);
      throw error;
    }
  });

  // Crear compra
  ipcMain.handle('purchase:create', async (_, data) => {
    try {
      return await PurchaseServices.create(data);
    } catch (error) {
      console.error('Error en purchase:create', error);
      throw error;
    }
  });

  // Actualizar purchase
  ipcMain.handle('purchase:update', async (_, id: number, data) => {
    try {
      return await PurchaseServices.update(id, data);
    } catch (error) {
      console.error('Error en purchase:update', error);
      throw error;
    }
  });

  // Eliminar purchase
  ipcMain.handle('purchase:delete', async (_, id: number) => {
    try {
      return await PurchaseServices.delete(id);
    } catch (error) {
      console.error('Error en purchase:delete', error);
      throw error;
    }
  });

}