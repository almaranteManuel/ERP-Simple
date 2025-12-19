import { registerProductoHandlers } from './productoHandlers';
import { registerProveedorHandlers } from './proveedorHandlers';
// import { registerCompraHandlers } from './compraHandlers';
// etc...

export function registerAllHandlers() {
  registerProductoHandlers();
  registerProveedorHandlers();
  // registerCompraHandlers();
  // registerVentaHandlers();
  // registerRecordatorioHandlers();
}