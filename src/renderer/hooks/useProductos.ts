// hooks/useProductos.ts
import { useState, useEffect, useCallback } from 'react';
import { ProductoConProveedor } from '../types/api.types';

export function useProductos() {
  const [productos, setProductos] = useState<ProductoConProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.producto.getAll();
      setProductos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = async (id: number): Promise<ProductoConProveedor | null> => {
    try {
      return await window.api.producto.getById(id);
    } catch (err) {
      console.error('Error al obtener producto:', err);
      throw err;
    }
  };

  const getByBarcode = async (barcode: string): Promise<ProductoConProveedor | null> => {
    try {
      return await window.api.producto.getByBarcode(barcode);
    } catch (err) {
      console.error('Error al buscar producto por código de barras:', err);
      throw err;
    }
  };

  const getByCodigo = async (codigo: string): Promise<ProductoConProveedor | null> => {
    try {
      return await window.api.producto.getByCodigo(codigo);
    } catch (err) {
      console.error('Error al buscar producto por código:', err);
      throw err;
    }
  };

  const getStockBajo = async (): Promise<ProductoConProveedor[]> => {
    try {
      return await window.api.producto.getStockBajo();
    } catch (err) {
      console.error('Error al obtener productos con stock bajo:', err);
      throw err;
    }
  };

  const createProducto = async (data: any): Promise<ProductoConProveedor> => {
    try {
      const result = await window.api.producto.create(data);
      await loadProductos(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      throw new Error(errorMessage);
    }
  };

  const updateProducto = async (id: number, data: any): Promise<ProductoConProveedor> => {
    try {
      const result = await window.api.producto.update(id, data);
      await loadProductos(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      throw new Error(errorMessage);
    }
  };

  const deleteProducto = async (id: number): Promise<void> => {
    try {
      await window.api.producto.delete(id);
      await loadProductos(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      throw new Error(errorMessage);
    }
  };

  const searchProductos = useCallback((searchTerm: string): ProductoConProveedor[] => {
    if (!searchTerm.trim()) {
      return productos;
    }

    const term = searchTerm.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.codigo?.toLowerCase().includes(term) ||
        p.codigoBarras?.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term)
    );
  }, [productos]);

  return {
    productos,
    loading,
    error,
    getById,
    getByBarcode,
    getByCodigo,
    getStockBajo,
    createProducto,
    updateProducto,
    deleteProducto,
    searchProductos,
    refresh: loadProductos,
  };
}