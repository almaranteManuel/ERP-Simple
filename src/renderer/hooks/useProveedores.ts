// hooks/useProveedores.ts
import { useState, useEffect } from 'react';
import { Proveedor } from '../types';


export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const data = await window.api.proveedor.getAll();
      setProveedores(data);
    } catch (err) {
      setError('Error al cargar proveedores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProveedor = async (data: any) => {
    try {
      const result = await window.api.proveedor.create(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateProveedor = async (id: number, data: any) => {
    try {
      const result = await window.api.proveedor.update(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteProveedor = async (id: number) => {
    try {
      await window.api.proveedor.delete(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    proveedores,
    loading,
    error,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    refresh: loadProveedores
  };
}