---

## 🔄 Flujo de Trabajo para Nuevas Funcionalidades

### 1. Modificar la Base de Datos (si es necesario)

```bash
# Editar prisma/schema.prisma
# Luego aplicar cambios:
npx prisma generate
npx prisma db push
```

### 2. Crear el Service (Backend)

Crear archivo en `src/main/services/NuevoModuloService.ts`:

```typescript
import prisma from '../database/prisma';

export class NuevoModuloService {
  async getAll() {
    return await prisma.nuevoModulo.findMany();
  }
  
  async create(data: any) {
    return await prisma.nuevoModulo.create({ data });
  }
  
  // ... más métodos
}
```

### 3. Crear IPC Handlers

Crear archivo en `src/main/ipc/nuevoModuloHandlers.ts`:

```typescript
import { ipcMain } from 'electron';
import { NuevoModuloService } from '../services/NuevoModuloService';

const service = new NuevoModuloService();

export function registerNuevoModuloHandlers() {
  ipcMain.handle('nuevoModulo:getAll', async () => {
    return await service.getAll();
  });
  
  // ... más handlers
}
```

### 4. Registrar Handlers

En `src/main/ipc/handlers.ts`:

```typescript
import { registerNuevoModuloHandlers } from './nuevoModuloHandlers';

export function registerAllHandlers() {
  registerProductoHandlers();
  registerNuevoModuloHandlers(); // ← Agregar aquí
  // ...
}
```

### 5. Exponer API en Preload

En `src/main/preload.ts`:

```typescript
contextBridge.exposeInMainWorld('api', {
  producto: { /* ... */ },
  nuevoModulo: {
    getAll: () => ipcRenderer.invoke('nuevoModulo:getAll'),
    create: (data: any) => ipcRenderer.invoke('nuevoModulo:create', data),
    // ...
  },
});
```

### 6. Crear Tipos (Frontend)

En `src/renderer/types/api.types.ts`:

```typescript
export interface NuevoModulo {
  id: number;
  nombre: string;
  // ...
}

// Actualizar el global Window
declare global {
  interface Window {
    api: {
      nuevoModulo: {
        getAll: () => Promise<NuevoModulo[]>;
        // ...
      };
    };
  }
}
```

### 7. Crear Hook de React

Crear `src/renderer/hooks/useNuevoModulo.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useNuevoModulo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await window.api.nuevoModulo.getAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return { items, loading, loadItems };
}
```

### 8. Crear Página de React

Crear `src/renderer/pages/NuevoModulo/NuevoModuloPage.tsx`:

```typescript
import React from 'react';
import { useNuevoModulo } from '../../hooks/useNuevoModulo';

export function NuevoModuloPage() {
  const { items, loading } = useNuevoModulo();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nuevo Módulo</h1>
      {/* Tu UI aquí */}
    </div>
  );
}
```

### 9. Probar

```bash
npm start
```