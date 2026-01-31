// hooks/useSales.ts
import { useState, useEffect, useCallback } from 'react';
import { SaleComplete, CreateSaleDTO, SaleStatistics, UpdateSaleDTO, BestSellingProduct } from '../../shared/types/api.types';

export function useSales() {
  const [sales, setSales] = useState<SaleComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.sale.getAll();
      setSales(data);
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
      return await window.api.sale.getById(id);
    } catch (err) {
      console.error('Error al obtener venta:', err);
      throw err;
    }
  };

  const getSalesToday = async (): Promise<any> => {
    try {
      return await window.api.sale.getSalesToday();
    } catch (err) {
      console.error('Error al obtener ventas de hoy:', err);
      throw err;
    }
  };

  const getByDateRange = async (dateFrom: Date, dateTo: Date): Promise<any> => {
    try {
      return await window.api.sale.getByDateRange(dateFrom, dateTo);
    } catch (err) {
      console.error('Error al obtener ventas por rango:', err);
      throw err;
    }
  };

  const createSale = async (data: CreateSaleDTO): Promise<any> => {
    try {
      const result = await window.api.sale.create(data);
      await loadSales(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear venta';
      throw new Error(errorMessage);
    }
  };

  const updateSale = async (
    id: number, 
    data: UpdateSaleDTO
  ): Promise<any> => {
    try {
      const result = await window.api.sale.update(id, data);
      await loadSales(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar venta';
      throw new Error(errorMessage);
    }
  };

  const anularSale = async (id: number): Promise<any> => {
    try {
      const result = await window.api.sale.anular(id);
      await loadSales(); // Recargar lista después de anular
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al anular venta';
      throw new Error(errorMessage);
    }
  };

  const deleteSale = async (id: number): Promise<void> => {
    try {
      await window.api.sale.delete(id);
      await loadSales(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar venta';
      throw new Error(errorMessage);
    }
  };

  const getStatistics = async (
    dateFrom?: Date, 
    dateTo?: Date
  ): Promise<SaleStatistics> => {
    try {
      return await window.api.sale.getStatistics(dateFrom, dateTo);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      throw err;
    }
  };

  const getProductsBestSelling = async (
    limit: number = 10,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<BestSellingProduct[]> => {
    try {
      return await window.api.sale.getProductsMasVendidos(limit, dateFrom, dateTo);
    } catch (err) {
      console.error('Error al obtener products más vendidos:', err);
      throw err;
    }
  };

  return {
    sales,
    loading,
    error,
    getById,
    getSalesToday,
    getByDateRange,
    createSale,
    updateSale,
    anularSale,
    deleteSale,
    getStatistics,
    getProductsBestSelling,
    refresh: loadSales,
  };
}