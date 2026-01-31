// hooks/useSuppliers.ts
import { useState, useEffect } from 'react';
import { SupplierComplete } from '../../shared/types/api.types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<SupplierComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await window.api.supplier.getAll();
      setSuppliers(data);
    } catch (err) {
      setError('Error al cargar Suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (data: any) => {
    try {
      const result = await window.api.supplier.create(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateSupplier = async (id: number, data: any) => {
    try {
      const result = await window.api.supplier.update(id, data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      await window.api.supplier.delete(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refresh: loadSuppliers
  };
}