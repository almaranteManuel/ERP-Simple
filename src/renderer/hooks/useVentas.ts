// hooks/useVentas.ts
import { useState, useEffect, useCallback } from 'react';
import { VentaCompleta, CreateVentaDTO, VentaEstadisticas, UpdateVentaDTO, ProductoMasVendido } from '../types/api.types';

export function useVentas() {
  const [ventas, setVentas] = useState<VentaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.venta.getAll();
      setVentas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar ventas';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = async (id: number): Promise<any> => {
    try {
      return await window.api.venta.getById(id);
    } catch (err) {
      console.error('Error al obtener venta:', err);
      throw err;
    }
  };

  const getVentasHoy = async (): Promise<any> => {
    try {
      return await window.api.venta.getVentasHoy();
    } catch (err) {
      console.error('Error al obtener ventas de hoy:', err);
      throw err;
    }
  };

  const getByDateRange = async (fechaInicio: Date, fechaFin: Date): Promise<any> => {
    try {
      return await window.api.venta.getByDateRange(fechaInicio, fechaFin);
    } catch (err) {
      console.error('Error al obtener ventas por rango:', err);
      throw err;
    }
  };

  const createVenta = async (data: CreateVentaDTO): Promise<any> => {
    try {
      const result = await window.api.venta.create(data);
      await loadVentas(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear venta';
      throw new Error(errorMessage);
    }
  };

  const updateVenta = async (
    id: number, 
    data: UpdateVentaDTO
  ): Promise<any> => {
    try {
      const result = await window.api.venta.update(id, data);
      await loadVentas(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar venta';
      throw new Error(errorMessage);
    }
  };

  const anularVenta = async (id: number): Promise<any> => {
    try {
      const result = await window.api.venta.anular(id);
      await loadVentas(); // Recargar lista después de anular
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al anular venta';
      throw new Error(errorMessage);
    }
  };

  const deleteVenta = async (id: number): Promise<void> => {
    try {
      await window.api.venta.delete(id);
      await loadVentas(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar venta';
      throw new Error(errorMessage);
    }
  };

  const getEstadisticas = async (
    fechaInicio?: Date, 
    fechaFin?: Date
  ): Promise<VentaEstadisticas> => {
    try {
      return await window.api.venta.getEstadisticas(fechaInicio, fechaFin);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      throw err;
    }
  };

  const getProductosMasVendidos = async (
    limite: number = 10,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<ProductoMasVendido[]> => {
    try {
      return await window.api.venta.getProductosMasVendidos(limite, fechaInicio, fechaFin);
    } catch (err) {
      console.error('Error al obtener productos más vendidos:', err);
      throw err;
    }
  };

  return {
    ventas,
    loading,
    error,
    getById,
    getVentasHoy,
    getByDateRange,
    createVenta,
    updateVenta,
    anularVenta,
    deleteVenta,
    getEstadisticas,
    getProductosMasVendidos,
    refresh: loadVentas,
  };
}