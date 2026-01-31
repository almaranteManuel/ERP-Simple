// @ts-nocheck
// src/renderer/types/api.types.ts
import { Product, Supplier, Sale, Purchase, SaleItem, PurchaseItem } from '@prisma/client';

// ============================================================================
// TIPOS BASE CON RELACIONES (para queries con include)
// ============================================================================

// PRODUCTS
export type ProductComplete = Product & {
  supplier?: Supplier | null;
  saleItems?: SaleItem[];
  purchaseItems?: PurchaseItem[];
};
export type ProductSearchResult = {
  id: number;
  description: string;
  code?: string | null;
  codeBar?: string | null;
  price: number;
  stock: number;
  is_active: boolean;
};

// Para el frontend, normalmente solo necesitas el product con su supplier
export type ProductWithSupplier = Product & {
  supplier?: Supplier | null;
};

// SUPPLIERS
export type SupplierComplete = Supplier & {
  products?: Product[];
  purchases?: Purchase[];
};

// ============================================================================
// DTOs PARA PRODUCTS
// ============================================================================

export interface CreateProductDTO {
  description?: string;
  code?: string;
  codeBar?: string;
  price: number;
  own_price: number;
  stock?: number;
  stockMin?: number;
  category?: string;
  image?: string;
  is_active?: boolean;
  variant?: number;
  supplierId?: number;
}

export interface UpdateProductDTO {
  description?: string;
  code?: string;
  codeBar?: string;
  price: number;
  own_price: number;
  stock?: number;
  stockMin?: number;
  category?: string;
  image?: string;
  is_active?: boolean;
  variant?: number;
  supplierId?: number;
}

// ============================================================================
// DTOs PARA SUPPLIERS
// ============================================================================

export interface CreateSupplierDTO {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierDTO {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ============================================================================
// VENTAS
// ============================================================================

export type SaleComplete = Sale & {
  items: (SaleItem & {
    product: Product;
  })[];
};

export interface SaleItemInput {
  productId: number;
  qty: number;
  priceUnitary: number;
  subtotal: number;
  discount?: number;
}

export interface CreateSaleDTO {
  items: SaleItemInput[];
  date: Date;
  subtotal: number;
  discount?: number;
  total: number;
  payMethod?: string;
  details?: string;
}

export interface UpdateSaleDTO {
  items: SaleItemInput[];
  payMethod?: string;
  details?: string;
  state?: string;
}

export interface SaleStatistics {
  totalSales: number;
  totalAmount: number;
  totalItems: number;
  averageSale: number;
  payMethods: Record<string, number>;
}

export interface BestSellingProduct {
  product: Product;
  totalSale: number;
  income: number;
}

// ============================================================================
// COMPRAS
// ============================================================================

export type PurchaseComplete = Purchase & {
  supplier: Supplier;
  items: (PurchaseItem & {
    product: Product;
  })[];
};

export interface PurchaseItemInput {
  productId: number;
  qty: number;
  priceUnitary: number;
  subtotal: number;
  discount?: number;
}

export interface CreatePurchaseDTO {
  supplierId: number;
  items: PurchaseItemInput[];
  subtotal: number;
  discount?: number;
  total: number;
  details?: string;
}

export interface UpdatePurchaseDTO {
  details?: string;
  state?: string;
  items: PurchaseItemInput[];
}

export interface PurchaseStatistics {
  totalPurchases: number;
  totalAmount: number;
  totalItems: number;
  averagePurchase: number;
}

// ============================================================================
// WINDOW API - Declaración global
// ============================================================================

declare global {
  interface Window {
    api: {
      // PRODUCTS
      product: {
        getAll: () => Promise<ProductWithSupplier[]>;
        getById: (id: number) => Promise<ProductWithSupplier | null>;
        getByBarcode: (barcode: string) => Promise<ProductWithSupplier | null>;
        getByCode: (codigo: string) => Promise<ProductWithSupplier | null>;
        getStockSlow: () => Promise<ProductWithSupplier[]>;
        create: (data: CreateProductDTO) => Promise<ProductWithSupplier>;
        update: (id: number, data: UpdateProductDTO) => Promise<ProductWithSupplier>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<ProductWithSupplier>;
        findOneByBarcode: (barcode: string) => Promise<ProductWithSupplier | null>;
      };

      // Suppliers
      supplier: {
        getAll: () => Promise<Supplier[]>;
        getById: (id: number) => Promise<Supplier | null>;
        create: (data: CreateSupplierDTO) => Promise<Supplier>;
        update: (id: number, data: UpdateSupplierDTO) => Promise<Supplier>;
        delete: (id: number) => Promise<void>;
        search: (query: string) => Promise<Supplier[]>;
      };

      // VENTAS
      sale: {
        getAll: () => Promise<SaleComplete[]>;
        getById: (id: number) => Promise<SaleComplete | null>;
        getSalesToday: () => Promise<SaleComplete[]>;
        getByDateRange: (fechaInicio: Date, fechaFin: Date) => Promise<SaleComplete[]>;
        create: (data: CreateSaleDTO) => Promise<SaleComplete>;
        update: (id: number, data: UpdateSaleDTO) => Promise<SaleComplete>;
        anular: (id: number) => Promise<SaleComplete>;
        delete: (id: number) => Promise<void>;
        getStatistics: (fechaInicio?: Date, fechaFin?: Date) => Promise<SaleStatistics>;
        getProductsMasVendidos: (
          limite?: number,
          fechaInicio?: Date,
          fechaFin?: Date
        ) => Promise<BestSellingProduct[]>;
      };

      // PurchaseS
      purchase: {
        getAll: () => Promise<PurchaseComplete[]>;
        getById: (id: number) => Promise<PurchaseComplete | null>;
        getBySupplier: (supplierId: number) => Promise<PurchaseComplete[]>;
        create: (data: CreatePurchaseDTO) => Promise<PurchaseComplete>;
        update: (id: number, data: UpdatePurchaseDTO) => Promise<PurchaseComplete>;
        anular: (id: number) => Promise<PurchaseComplete>;
        delete: (id: number) => Promise<void>;
        getStatistics: (fechaInicio?: Date, fechaFin?: Date) => Promise<PurchaseStatistics>;
      };
    };
  }
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface DateRange {
  dateFrom: Date;
  dateTo: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum EstadoVenta {
  COMPLETADA = 'completada',
  ANULADA = 'anulada',
  PENDIENTE = 'pendiente',
}

export enum EstadoCompra {
  COMPLETADA = 'completada',
  ANULADA = 'anulada',
  PENDIENTE = 'pendiente',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  DEBITO = 'debito',
  CREDITO = 'credito',
}

// ============================================================================
// RE-EXPORTS de Prisma (para conveniencia)
// ============================================================================

export type { Product, Supplier, Sale, Purchase, SaleItem, PurchaseItem };