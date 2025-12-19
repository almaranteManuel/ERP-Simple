// hooks/useProductos.ts
import { useState, useEffect } from 'react';
import { ProductoConProveedor } from '../types/api.types';

export function useProductos() {
  const [productos, setProductos] = useState<ProductoConProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const data = await window.api.producto.getAll();
      setProductos(data);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProducto = async (data: any) => {
    try {
      const result = await window.api.producto.create(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateProducto = async (id: number, data: any) => {
    try {
      const result = await window.api.producto.update(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteProducto = async (id: number) => {
    try {
      await window.api.producto.delete(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
    refresh: loadProductos
  };
}