# HU-015 - Repartidor

Se agregó un panel del repartidor con acceso a:
- Mis cargas.
- Pedidos por entregar.

En cada pedido se puede:
- Confirmar garrafones entregados.
- Registrar envases vacíos recibidos.
- Registrar pago en efectivo o transferencia.
- Reportar cliente ausente o falta de envases.
- Ver el acumulado cobrado del día.

## Venta por tipo de garrafón (cambio reciente)

En "Pedidos por entregar" → "Vender":

- Se muestran los garrafones llenos asignados a la
  carga del repartidor, desglosados por tipo
  (ej. 20 Bonafont y 5 Ciel). El repartidor elige
  el tipo y la cantidad; no puede vender más de lo
  que tiene disponible por tipo.
- La venta puede incluir uno o varios tipos de
  garrafón. El precio sigue siendo el
  `precioPorGarrafon` del cliente.
- Los envases vacíos se seleccionan de una lista de
  los garrafones vacíos registrados en inventario
  (insumos con "vacío" en el nombre o tipo). Se
  puede alternar a "Todos" para elegir cualquier
  insumo. Los vacíos recibidos se suman al
  inventario de planta de ese insumo.
- El panel superior tiene un desplegable con el
  detalle por tipo: "Llenos en carga" y
  "Vacíos recibidos hoy".

En la web (Cargas de Garrafones):

- El encargado puede asignar varios tipos de
  garrafón a un repartidor en una sola operación
  (endpoint `POST /api/cargas/multiple`).

API:
- `POST /api/ventas/ruta/registrar` ahora recibe
  `garrafones: [{inventarioId, cantidad}]` y
  `envasesVacios: [{inventarioId, cantidad}]`.
- El descuento de carga se hace por tipo de garrafón.
- Las entregas (`/api/ventas/repartidor/{id}/entregas-hoy`)
  regresan el desglose por tipo en
  `garrafonesDetalle` y `envasesVaciosDetalle`.
- `PUT /api/rutas/{id}/activar` ya no vincula una carga
  (el repartidor acepta sus cargas en "Mis cargas").
