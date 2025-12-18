import { app, BrowserWindow } from 'electron';
import { registerAllHandlers } from './ipc/handlers';

// Declare las variables globales de webpack
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

function createWindow(): void {
  // Crear la ventana del navegador
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Cargar el index.html de la app
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Abrir las DevTools en desarrollo (opcional)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Este método se llamará cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
app.whenReady().then(() => {
  registerAllHandlers();
  createWindow();

  // En macOS, es común re-crear una ventana cuando
  // se hace clic en el icono del dock y no hay otras ventanas abiertas.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
// En macOS, es común que las aplicaciones y su barra de menú
// permanezcan activas hasta que el usuario salga explícitamente con Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});