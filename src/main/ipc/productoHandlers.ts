import { ipcMain } from 'electron';
import { ProductoService } from '../services/ProductoService';

const productoService = new ProductoService();

export function registerProductoHandlers() {
  // Obtener todos los productos
  ipcMain.handle('producto:getAll', async () => {
    try {
      return await productoService.getAll();
    } catch (error) {
      console.error('Error en producto:getAll', error);
      throw error;
    }
  });

  // Obtener producto por ID
  ipcMain.handle('producto:getById', async (_, id: number) => {
    try {
      return await productoService.getById(id);
    } catch (error) {
      console.error('Error en producto:getById', error);
      throw error;
    }
  });

  // Crear producto
  ipcMain.handle('producto:create', async (_, data) => {
    try {
      return await productoService.create(data);
    } catch (error) {
      console.error('Error en producto:create', error);
      throw error;
    }
  });

  // Actualizar producto
  ipcMain.handle('producto:update', async (_, id: number, data) => {
    try {
      return await productoService.update(id, data);
    } catch (error) {
      console.error('Error en producto:update', error);
      throw error;
    }
  });

  // Eliminar producto
  ipcMain.handle('producto:delete', async (_, id: number) => {
    try {
      return await productoService.delete(id);
    } catch (error) {
      console.error('Error en producto:delete', error);
      throw error;
    }
  });

  // Buscar productos
  ipcMain.handle('producto:search', async (_, query: string) => {
    try {
      return await productoService.searchByName(query);
    } catch (error) {
      console.error('Error en producto:search', error);
      throw error;
    }
  });

  // Obtener productos con stock bajo
  ipcMain.handle('producto:getLowStock', async () => {
    try {
      return await productoService.getLowStock();
    } catch (error) {
      console.error('Error en producto:getLowStock', error);
      throw error;
    }
  });
}