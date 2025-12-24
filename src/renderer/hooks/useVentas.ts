// hooks/useVentas.ts
import { useState, useEffect } from 'react';
import { Venta } from '../types';


export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const data = await window.api.venta.getAll();
      setVentas(data);
    } catch (err) {
      setError('Error al cargar ventas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createVenta = async (data: any) => {
    try {
      const result = await window.api.venta.create(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateVenta = async (id: number, data: any) => {
    try {
      const result = await window.api.venta.update(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteVenta = async (id: number) => {
    try {
      await window.api.venta.delete(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    ventas,
    loading,
    error,
    createVenta,
    updateVenta,
    deleteVenta,
    refresh: loadVentas
  };
}