import prisma from '../database/prisma';
import { Proveedor } from '@prisma/client';

export class ProveedorService {
    async getAll(): Promise<Proveedor[]> {
        try {
            return await prisma.proveedor.findMany({
                orderBy: {
                    createdAt: 'asc',
                },
            });
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            throw new Error('No se pudieron cargar los proveedores');
        }
    }

    async getById(id: number): Promise<Proveedor | null> {
        try {
            return await prisma.proveedor.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error('Error al obtener proveedor:', error);
            throw new Error('No se pudo cargar el proveedor');
        }
    }

    async create(data: {
        nombre: string;
        telefono?: string;
        email: string;
        direccion?: string;
    }): Promise<Proveedor> {
        try {
            return await prisma.proveedor.create({
                data,
            });
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            throw new Error('No se pudo crear el proveedor');
        }
    }

    async update(
        id: number,
        data: {
            nombre: string;
            telefono?: string;
            email: string;
            direccion?: string;
        }
    ): Promise<Proveedor> {
        try {
            return await prisma.proveedor.update({
                where: { id },
                data,
            });
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            throw new Error('No se pudo actualizar el proveedor');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.proveedor.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            throw new Error('No se pudo eliminar el proveedor');
        }
    }

    async searchByName(query: string): Promise<Proveedor[]> {
        try {
            return await prisma.proveedor.findMany({
                where: {
                    nombre: {
                        contains: query,
                    },
                },
            });
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
            throw new Error('No se pudieron buscar los proveedores');
        }
    }
}