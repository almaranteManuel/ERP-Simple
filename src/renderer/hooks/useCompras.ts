// hooks/useCompras.ts
import { useState, useEffect } from 'react';
import { Compra } from '../types';


export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async () => {
    try {
      setLoading(true);
      const data = await window.api.compra.getAll();
      setCompras(data);
    } catch (err) {
      setError('Error al cargar compras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCompra = async (data: any) => {
    try {
      const result = await window.api.compra.create(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateCompra = async (id: number, data: any) => {
    try {
      const result = await window.api.compra.update(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteCompra = async (id: number) => {
    try {
      await window.api.compra.delete(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    compras,
    loading,
    error,
    createCompra,
    updateCompra,
    deleteCompra,
    refresh: loadCompras
  };
}