import { ipcMain } from 'electron';
import { ProductService } from '../services/ProductService';

const productService = new ProductService();

export function registerProductHandlers() {
  // Obtener todos los products
  ipcMain.handle('product:getAll', async () => {
    try {
      return await productService.getAll();
    } catch (error) {
      console.error('Error en product:getAll', error);
      throw error;
    }
  });

  // Obtener product por ID
  ipcMain.handle('product:getById', async (_, id: number) => {
    try {
      return await productService.getById(id);
    } catch (error) {
      console.error('Error en product:getById', error);
      throw error;
    }
  });

  // Crear product
  ipcMain.handle('product:create', async (_, data) => {
    try {
      return await productService.create(data);
    } catch (error) {
      console.error('Error en product:create', error);
      throw error;
    }
  });

  // Actualizar product
  ipcMain.handle('product:update', async (_, id: number, data) => {
    try {
      return await productService.update(id, data);
    } catch (error) {
      console.error('Error en product:update', error);
      throw error;
    }
  });

  // Eliminar product
  ipcMain.handle('product:delete', async (_, id: number) => {
    try {
      return await productService.delete(id);
    } catch (error) {
      console.error('Error en product:delete', error);
      throw error;
    }
  });

  // Buscar products
  // ipcMain.handle('product:search', async (_, query: string) => {
  //   try {
  //     return await productService.searchByCode(query);
  //   } catch (error) {
  //     console.error('Error en product:search', error);
  //     throw error;
  //   }
  // });

  // Obtener products con stock bajo
  ipcMain.handle('product:getLowStock', async () => {
    try {
      return await productService.getLowStock();
    } catch (error) {
      console.error('Error en product:getLowStock', error);
      throw error;
    }
  });

  ipcMain.handle('product:getByBarcode', async (_, barcode: string) => {
    // Necesitas implementar este método en ProductService
    return await productService.getByBarcode(barcode);
  });

  ipcMain.handle('product:getByCodigo', async (_, codigo: string) => {
    // Método para buscar por código interno
    return await productService.getByCode(codigo);
  });

  ipcMain.handle('product:search', async (_, query: string) => {
    try {
      return await productService.search(query);
    } catch (error) {
      console.error('Error en product:search', error);
      throw error;
    }
  });

  ipcMain.handle('product:findOneByBarcode', async (_, barcode: string) => {
    try {
      return await productService.findOneByBarcode(barcode);
    } catch (error) {
      console.error('Error en product:findOneByBarcode', error);
      throw error;
    }
  });
}