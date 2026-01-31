// @ts-nocheck
import prisma from '../database/prisma';
import { Product } from '@prisma/client';
import { ProductSearchResult, CreateProductDTO } from '../../shared/types/api.types';

function toJSON<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class ProductService {
  async getAll(): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          code: 'asc',
        },
      });

      return toJSON(products);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw new Error('No se pudieron cargar los productos');
    }
  }

  async getById(id: number): Promise<Product | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw new Error('No se pudo cargar el producto');
    }
  }

  async create(data: CreateProductDTO): Promise<Product> {
    try {
      return await prisma.product.create({
        data,
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error('No se pudo crear el producto');
    }
  }

  async update(
    id: number,
    data: {
      description?: string;
      code?: string;
      codeBar?: string;
      price: number;
      own_price?: number;
      stock: number;
      stockMin: number;
      category?: string;
      image?: string;
      is_active: boolean;
      variant?: number;
    }
  ): Promise<Product> {
    try {
      return await prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('No se pudo actualizar el producto');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('No se pudo eliminar el producto');
    }
  }

  async searchByCode(query: string): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          code: {
            contains: query,
          },
        },
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw new Error('No se pudieron buscar los productos');
    }
  }

  async getLowStock(): Promise<any> {
    try {
      // Para SQLite, necesitas traer todos y filtrar en memoria
      // O usar un valor fijo como umbral
      const products = await prisma.product.findMany({
        where: {
          stock: {
            lte: 10, // Umbral fijo de 10 unidades
          },
        },
      });
      return products;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw new Error('No se pudieron cargar los productos con stock bajo');
    }
  }

  // En ProductService
  async getByBarcode(barcode: string): Promise<Product | null> {
    return await prisma.product.findFirst({
      where: {
        OR: [
          { codeBar: barcode },
          { code: barcode }
        ],
        is_active: true
      }
    });
  }

  async getByCode(code: string): Promise<Product | null> {
    return await prisma.product.findFirst({
      where: {
        code,
        is_active: true
      }
    });
  }

  // En ProductService - agregar búsqueda mejorada
  async search(searchTerm: string): Promise<ProductSearchResult | null> {
    try {
      return await prisma.product.findFirst({
        where: {
          OR: [
            { codeBar: searchTerm },
            { code: searchTerm },
            {
              description: {
                contains: searchTerm
              }
            }
          ],
          is_active: true
        },
        // Solo traer los campos necesarios
        select: {
          id: true,
          description: true,
          price: true,
          stock: true,
          is_active: true,
          codeBar: true,
          code: true
        }
      });
    } catch (error) {
      console.error('Error en búsqueda de producto:', error);
      throw new Error('Error en búsqueda');
    }
  }

  async findOneByBarcode(barcode: string): Promise<Product | null> {
    return await this.getByBarcode(barcode);
  }

}