import prisma from '../database/prisma';
import { Compra } from '@prisma/client';

export class CompraService {
    async getAll(): Promise<Compra[]> {
        try {
            return await prisma.compra.findMany({
                orderBy: {
                    createdAt: 'asc',
                },
            });
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw new Error('No se pudieron cargar las compras');
        }
    }

    async getById(id: number): Promise<Compra | null> {
        try {
            return await prisma.compra.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw new Error('No se pudo cargar la compra');
        }
    }

    async create(data: {
        fecha: Date;
        total?: number;
        proveedorId: number;
    }): Promise<Compra> {
        try {
            return await prisma.compra.create({
                data: {
                    fecha: data.fecha,
                    total: data.total,
                    proveedor: {
                        connect: { id: data.proveedorId },
                    },
                },
            });
        } catch (error) {
            console.error('Error al crear compra:', error);
            throw new Error('No se pudo crear la compra');
        }
    }

    async update(
        id: number,
        data: {
            fecha: Date;
            total?: number;
            proveedorId: number;
        }
    ): Promise<Compra> {
        try {
            return await prisma.compra.update({
                where: { id },
                data: {
                    fecha: data.fecha,
                    total: data.total,
                    proveedor: {
                        connect: { id: data.proveedorId },
                    },
                },
            });
        } catch (error) {
            console.error('Error al actualizar compra:', error);
            throw new Error('No se pudo actualizar la compra');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.compra.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar compra:', error);
            throw new Error('No se pudo eliminar la compra');
        }
    }

}