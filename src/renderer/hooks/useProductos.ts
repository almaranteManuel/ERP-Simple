import { useState, useEffect } from 'react';
import { productoApi } from '../api/ipc';
import { ProductoConProveedor } from '../types/api.types';

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productoApi.getAll();
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
      const nuevo = await productoApi.create(data);
      setProductos(prev => [...prev, nuevo]);
      return nuevo;
    } catch (err) {
      setError('Error al crear producto');
      throw err;
    }
  };

  const updateProducto = async (id: number, data: any) => {
    try {
      const actualizado = await productoApi.update(id, data);
      setProductos(prev => 
        prev.map(p => p.id === id ? actualizado : p)
      );
      return actualizado;
    } catch (err) {
      setError('Error al actualizar producto');
      throw err;
    }
  };

  const deleteProducto = async (id: number) => {
    try {
      await productoApi.delete(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar producto');
      throw err;
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  return {
    productos,
    loading,
    error,
    loadProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}