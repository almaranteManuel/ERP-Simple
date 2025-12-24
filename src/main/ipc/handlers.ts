import { registerProductoHandlers } from './productoHandlers';
import { registerProveedorHandlers } from './proveedorHandlers';
import { registerVentaHandlers } from './ventaHandlers';

// import { registerCompraHandlers } from './compraHandlers';
// etc...

export function registerAllHandlers() {
  registerProductoHandlers();
  registerProveedorHandlers();
  registerVentaHandlers();
  // registerCompraHandlers();
  // registerRecordatorioHandlers();
}