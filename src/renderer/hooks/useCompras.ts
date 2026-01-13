// hooks/useCompras.ts
import { useState, useEffect, useCallback } from 'react';
import { CompraCompleta } from '../types/api.types';

interface CompraItemInput {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento?: number;
}

interface CreateCompraInput {
  proveedorId: number;
  items: CompraItemInput[];
  subtotal: number;
  impuestos?: number;
  descuento?: number;
  total: number;
  observaciones?: string;
}

interface CompraEstadisticas {
  totalCompras: number;
  montoTotal: number;
  totalItems: number;
  promedioCompra: number;
}

export function useCompras() {
  const [compras, setCompras] = useState<CompraCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.compra.getAll();
      setCompras(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar compras';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = async (id: number): Promise<CompraCompleta | null> => {
    try {
      return await window.api.compra.getById(id);
    } catch (err) {
      console.error('Error al obtener compra:', err);
      throw err;
    }
  };

  const getByProveedor = async (proveedorId: number): Promise<CompraCompleta[]> => {
    try {
      return await window.api.compra.getByProveedor(proveedorId);
    } catch (err) {
      console.error('Error al obtener compras del proveedor:', err);
      throw err;
    }
  };

  const createCompra = async (data: CreateCompraInput): Promise<CompraCompleta> => {
    try {
      const result = await window.api.compra.create(data);
      await loadCompras(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear compra';
      throw new Error(errorMessage);
    }
  };

  const updateCompra = async (
    id: number, 
    data: { observaciones?: string; estado?: string }
  ): Promise<CompraCompleta> => {
    try {
      const result = await window.api.compra.update(id, data);
      await loadCompras(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar compra';
      throw new Error(errorMessage);
    }
  };

  const anularCompra = async (id: number): Promise<CompraCompleta> => {
    try {
      const result = await window.api.compra.anular(id);
      await loadCompras(); // Recargar lista después de anular
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al anular compra';
      throw new Error(errorMessage);
    }
  };

  const deleteCompra = async (id: number): Promise<void> => {
    try {
      await window.api.compra.delete(id);
      await loadCompras(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar compra';
      throw new Error(errorMessage);
    }
  };

  const getEstadisticas = async (
    fechaInicio?: Date, 
    fechaFin?: Date
  ): Promise<CompraEstadisticas> => {
    try {
      return await window.api.compra.getEstadisticas(fechaInicio, fechaFin);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      throw err;
    }
  };

  return {
    compras,
    loading,
    error,
    getById,
    getByProveedor,
    createCompra,
    updateCompra,
    anularCompra,
    deleteCompra,
    getEstadisticas,
    refresh: loadCompras,
  };
}