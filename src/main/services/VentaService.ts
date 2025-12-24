import prisma from '../database/prisma';
import { Venta } from '@prisma/client';

export class VentaService {
    async getAll(): Promise<Venta[]> {
        try {
            return await prisma.venta.findMany({
                orderBy: {
                    createdAt: 'asc',
                },
            });
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw new Error('No se pudieron cargar las ventas');
        }
    }

    async getById(id: number): Promise<Venta | null> {
        try {
            return await prisma.venta.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw new Error('No se pudo cargar la venta');
        }
    }

    async create(data: {
        fecha: Date;
        total?: number;
        productoId: number;
    }): Promise<Venta> {
        try {
            return await prisma.venta.create({
                data: {
                    fecha: data.fecha,
                    total: data.total,
                    producto: {
                        connect: { id: data.productoId },
                    },
                },
            });
        } catch (error) {
            console.error('Error al crear venta:', error);
            throw new Error('No se pudo crear la venta');
        }
    }

    async update(
        id: number,
        data: {
            fecha: Date;
            total?: number;
            productoId: number;
        }
    ): Promise<Venta> {
        try {
            return await prisma.venta.update({
                where: { id },
                data: {
                    fecha: data.fecha,
                    total: data.total,
                    producto: {
                        connect: { id: data.productoId },
                    },
                },
            });
        } catch (error) {
            console.error('Error al actualizar venta:', error);
            throw new Error('No se pudo actualizar la venta');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.venta.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            throw new Error('No se pudo eliminar la venta');
        }
    }

}