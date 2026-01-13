import prisma from '../database/prisma';
import { Producto } from '@prisma/client';

export class ProductoService {
  async getAll(): Promise<Producto[]> {
    try {
      return await prisma.producto.findMany({
        orderBy: {
          codigo: 'asc',
        },
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw new Error('No se pudieron cargar los productos');
    }
  }

  async getById(id: number): Promise<Producto | null> {
    try {
      return await prisma.producto.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw new Error('No se pudo cargar el producto');
    }
  }

  async create(data: {
      nombre: string;
      descripcion?: string;
      codigo?: string;
      codigoBarras?: string;
      precio: number;
      stock: number;
      stockMinimo: number;
      categoria?: string;
      imagen?: string;
      activo: boolean;
      variante?: number;
  }): Promise<Producto> {
    try {
      return await prisma.producto.create({
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
      nombre: string;
      descripcion?: string;
      codigo?: string;
      codigoBarras?: string;
      precio: number;
      stock: number;
      stockMinimo: number;
      categoria?: string;
      imagen?: string;
      activo: boolean;
      variante?: number;
    }
  ): Promise<Producto> {
    try {
      return await prisma.producto.update({
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
      await prisma.producto.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('No se pudo eliminar el producto');
    }
  }

  async searchByCode(query: string): Promise<Producto[]> {
    try {
      return await prisma.producto.findMany({
        where: {
          codigo: {
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
      const products = await prisma.producto.findMany({
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

  // En ProductoService
  async getByBarcode(barcode: string): Promise<Producto | null> {
    try {
      // Buscar por código de barras O código normal
      return await prisma.producto.findFirst({
        where: {
          OR: [
            { codigoBarras: barcode },
            { codigo: barcode }
          ],
          activo: true
        }
      });
    } catch (error) {
      console.error('Error al buscar producto por código:', error);
      throw new Error('No se pudo buscar el producto');
    }
  }

  async getByCodigo(codigo: string): Promise<Producto | null> {
    try {
      return await prisma.producto.findFirst({
        where: {
          codigo: codigo,
        },
      });
    } catch (error) {
      console.error('Error al buscar producto por código:', error);
      throw new Error('No se pudo buscar el producto');
    }
  }

  // En ProductoService - agregar búsqueda mejorada
  async search(searchTerm: string): Promise<Producto | null> {
    try {
      return await prisma.producto.findFirst({
        where: {
          OR: [
            { codigoBarras: searchTerm },
            { codigo: searchTerm },
            {
              nombre: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ],
          activo: true
        },
        // Solo traer los campos necesarios
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          precio: true,
          stock: true,
          activo: true,
          codigoBarras: true,
          codigo: true
        }
      });
    } catch (error) {
      console.error('Error en búsqueda de producto:', error);
      throw new Error('Error en búsqueda');
    }
  }
}