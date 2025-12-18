import { PrismaClient } from '@prisma/client';
import path from 'path';
import { app } from 'electron';

// Determinar la ruta de la base de datos según el entorno
const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev
  ? path.join(__dirname, '../../../prisma/erp.db')
  : path.join(app.getPath('userData'), 'erp.db');

// Crear instancia única de Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

export default prisma;