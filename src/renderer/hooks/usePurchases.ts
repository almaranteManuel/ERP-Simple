// hooks/usePurchases.ts
import { useState, useEffect, useCallback } from 'react';
import { PurchaseComplete, PurchaseItemInput, CreatePurchaseDTO, UpdatePurchaseDTO, PurchaseStatistics } from '../../shared/types/api.types';

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.purchase.getAll();
      setPurchases(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar compras';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = async (id: number): Promise<PurchaseComplete | null> => {
    try {
      return await window.api.purchase.getById(id);
    } catch (err) {
      console.error('Error al obtener compra:', err);
      throw err;
    }
  };

  const getBySupplier = async (supplierId: number): Promise<PurchaseComplete[]> => {
    try {
      return await window.api.purchase.getBySupplier(supplierId);
    } catch (err) {
      console.error('Error al obtener compras del supplier:', err);
      throw err;
    }
  };

  const createPurchase = async (data: CreatePurchaseDTO): Promise<PurchaseComplete> => {
    try {
      const result = await window.api.purchase.create(data);
      await loadPurchases(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear compra';
      throw new Error(errorMessage);
    }
  };

  const updatePurchase = async (  
    id: number,
    data: UpdatePurchaseDTO
  ): Promise<PurchaseComplete> => {
    try {
      const result = await window.api.purchase.update(id, data);
      await loadPurchases(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar compra';
      throw new Error(errorMessage);
    }
  };

  const anularPurchase = async (id: number): Promise<PurchaseComplete> => {
    try {
      const result = await window.api.purchase.anular(id);
      await loadPurchases(); // Recargar lista después de anular
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al anular compra';
      throw new Error(errorMessage);
    }
  };

  const deletePurchase = async (id: number): Promise<void> => {
    try {
      await window.api.purchase.delete(id);
      await loadPurchases(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar compra';
      throw new Error(errorMessage);
    }
  };

  const getStatistics = async (
    dateFrom?: Date, 
    dateTo?: Date
  ): Promise<PurchaseStatistics> => {
    try {
      return await window.api.purchase.getStatistics(dateFrom, dateTo);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      throw err;
    }
  };

  return {
    purchases,
    loading,
    error,
    getById,
    getBySupplier,
    createPurchase,
    updatePurchase,
    anularPurchase,
    deletePurchase,
    getStatistics,
    refresh: loadPurchases,
  };
}