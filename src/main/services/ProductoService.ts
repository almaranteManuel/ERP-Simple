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
          nombre: 'asc',
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
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    stockMinimo: number;
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
      nombre?: string;
      descripcion?: string;
      precio?: number;
      stock?: number;
      stockMinimo?: number;
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

  async searchByName(query: string): Promise<Producto[]> {
    try {
      return await prisma.producto.findMany({
        where: {
          nombre: {
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
      // Prisma doesn't support column-to-column comparisons in filters,
      // so fetch and filter in JavaScript.
      const products = await prisma.producto.findMany({
        include: {
          proveedor: true,
        },
      });
      return products.filter((p) => p.stock <= p.stockMinimo);
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw new Error('No se pudieron cargar los productos con stock bajo');
    }
  }
}