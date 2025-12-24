import { ipcMain } from 'electron';
import { VentaService } from '../services/VentaService';

const SaleService = new VentaService();

export function registerVentaHandlers() {
  // Obtener todas las ventas
  ipcMain.handle('venta:getAll', async () => {
    try {
      return await SaleService.getAll();
    } catch (error) {
      console.error('Error en venta:getAll', error);
      throw error;
    }
  });

  // Obtener venta por ID
  ipcMain.handle('venta:getById', async (_, id: number) => {
    try {
      return await SaleService.getById(id);
    } catch (error) {
      console.error('Error en venta:getById', error);
      throw error;
    }
  });

  // Crear venta
  ipcMain.handle('venta:create', async (_, data) => {
    try {
      return await SaleService.create(data);
    } catch (error) {
      console.error('Error en venta:create', error);
      throw error;
    }
  });

  // Actualizar venta
  ipcMain.handle('venta:update', async (_, id: number, data) => {
    try {
      return await SaleService.update(id, data);
    } catch (error) {
      console.error('Error en venta:update', error);
      throw error;
    }
  });

  // Eliminar venta
  ipcMain.handle('venta:delete', async (_, id: number) => {
    try {
      return await SaleService.delete(id);
    } catch (error) {
      console.error('Error en venta:delete', error);
      throw error;
    }
  });

}