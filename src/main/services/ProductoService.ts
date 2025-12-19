import prisma from '../database/prisma';
import { Producto } from '@prisma/client';

export class ProductoService {
  async getAll(): Promise<Producto[]> {
    try {
      return await prisma.producto.findMany({
        include: {
          proveedor: true,
        },
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
        include: {
          proveedor: true,
        },
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw new Error('No se pudo cargar el producto');
    }
  }

  async create(data: {
    codigo: string;
    descripcion?: string;
    precio: number;
    precio_propio?: number;
    stock: number;
    variante?: number;
    proveedorId?: number;
  }): Promise<Producto> {
    try {
      return await prisma.producto.create({
        data,
        include: {
          proveedor: true,
        },
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error('No se pudo crear el producto');
    }
  }

  async update(
    id: number,
    data: {
      codigo?: string;
      descripcion?: string;
      precio?: number;
      precio_propio?: number;
      stock?: number;
      variante?: number;
      proveedorId?: number;
    }
  ): Promise<Producto> {
    try {
      return await prisma.producto.update({
        where: { id },
        data,
        include: {
          proveedor: true,
        },
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
        include: {
          proveedor: true,
        },
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw new Error('No se pudieron buscar los productos');
    }
  }

  async getLowStock(): Promise<Producto[]> {
    try {
      // Para SQLite, necesitas traer todos y filtrar en memoria
      // O usar un valor fijo como umbral
      const products = await prisma.producto.findMany({
        where: {
          stock: {
            lte: 10, // Umbral fijo de 10 unidades
          },
        },
        include: {
          proveedor: true,
        },
      });
      return products;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw new Error('No se pudieron cargar los productos con stock bajo');
    }
  }
}