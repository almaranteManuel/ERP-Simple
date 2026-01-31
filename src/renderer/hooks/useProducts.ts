// @ts-nocheck
// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { ProductWithSupplier } from '../../shared/types/api.types';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.product.getAll();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar products';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = async (id: number): Promise<ProductWithSupplier | null> => {
    try {
      return await window.api.product.getById(id);
    } catch (err) {
      console.error('Error al obtener product:', err);
      throw err;
    }
  };

  const getByBarcode = async (barcode: string): Promise<ProductWithSupplier | null> => {
    try {
      return await window.api.product.getByBarcode(barcode);
    } catch (err) {
      console.error('Error al buscar product por código de barras:', err);
      throw err;
    }
  };

  const getByCode = async (codigo: string): Promise<ProductWithSupplier | null> => {
    try {
      return await window.api.product.getByCode(codigo);
    } catch (err) {
      console.error('Error al buscar product por código:', err);
      throw err;
    }
  };

  const getStockSlow = async (): Promise<ProductWithSupplier[]> => {
    try {
      return await window.api.product.getStockSlow();
    } catch (err) {
      console.error('Error al obtener products con stock bajo:', err);
      throw err;
    }
  };

  const createProduct = async (data: any): Promise<ProductWithSupplier> => {
    try {
      const result = await window.api.product.create(data);
      await loadProducts(); // Recargar lista después de crear
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      throw new Error(errorMessage);
    }
  };

  const updateProduct = async (id: number, data: any): Promise<ProductWithSupplier> => {
    try {
      const result = await window.api.product.update(id, data);
      await loadProducts(); // Recargar lista después de actualizar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      throw new Error(errorMessage);
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      await window.api.product.delete(id);
      await loadProducts(); // Recargar lista después de eliminar
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      throw new Error(errorMessage);
    }
  };

  const searchProducts = useCallback((searchTerm: string): ProductWithSupplier[] => {
    if (!searchTerm.trim()) {
      return products;
    }

    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.description?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.codeBar?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products]);

  const findOneByBarcode = async (barcode: string): Promise<ProductWithSupplier | null> => {
    try {
      return await window.api.product.findOneByBarcode(barcode);
    } catch (err) {
      console.error('Error al buscar product por código de barras:', err);
      throw err;
    }
  };


  return {
    products,
    loading,
    error,
    getById,
    getByBarcode,
    getByCode,
    getStockSlow,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    findOneByBarcode,
    refresh: loadProducts,
  };
}