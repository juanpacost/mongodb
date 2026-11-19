// =====================================================================
// 05 - Consultas de agregación: contar, sumar, promediar, máximos y
//      mínimos
// =====================================================================

db = db.getSiblingDB("tienda_productos")

// ---------------------------------------------------------------------
// CONTAR Y SUMAR
// ---------------------------------------------------------------------
// Pedidos por estado
db.pedidos.aggregate([
  { $group: { _id: "$estado", cantidad_pedidos: { $sum: 1 } } },
  { $sort: { cantidad_pedidos: -1 } }
])

// Etapa $count: pedidos entregados (18)
db.pedidos.aggregate([
  { $match: { estado: "entregado" } },
  { $count: "pedidos_entregados" }
])

// Ventas por método de pago (sin cancelados)
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: { _id: "$metodo_pago", total_vendido: { $sum: "$total" }, pedidos: { $sum: 1 } } },
  { $sort: { total_vendido: -1 } }
])

// Ingreso total de la tienda (42.265.400 en 35 pedidos)
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: { _id: null, ingreso_total: { $sum: "$total" }, pedidos_validos: { $sum: 1 } } }
])

// Los 5 productos con más unidades vendidas
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $unwind: "$items" },
  { $group: {
      _id: "$items.producto_id",
      unidades_vendidas: { $sum: "$items.cantidad" },
      ingresos: { $sum: { $multiply: ["$items.cantidad", "$items.precio_unitario"] } }
  } },
  { $sort: { unidades_vendidas: -1, ingresos: -1 } },
  { $limit: 5 },
  { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "producto" } },
  { $project: { _id: 0, producto: { $first: "$producto.nombre" }, unidades_vendidas: 1, ingresos: 1 } }
])

// Valor del inventario por categoría
db.productos.aggregate([
  { $group: { _id: "$categoria_id", valor_inventario: { $sum: { $multiply: ["$precio", "$stock"] } } } },
  { $lookup: { from: "categorias", localField: "_id", foreignField: "_id", as: "categoria" } },
  { $project: { _id: 0, categoria: { $first: "$categoria.nombre" }, valor_inventario: 1 } },
  { $sort: { valor_inventario: -1 } }
])

// ---------------------------------------------------------------------
// PROMEDIOS, MÁXIMOS Y MÍNIMOS
// ---------------------------------------------------------------------
// Estadísticas generales de precios
db.productos.aggregate([
  { $group: {
      _id: null,
      total_productos: { $sum: 1 },
      precio_promedio: { $avg: "$precio" },
      precio_maximo: { $max: "$precio" },
      precio_minimo: { $min: "$precio" }
  } },
  { $project: { _id: 0, total_productos: 1, precio_promedio: { $round: ["$precio_promedio", 0] }, precio_maximo: 1, precio_minimo: 1 } }
])

// Precio promedio, máximo y mínimo por categoría
db.productos.aggregate([
  { $group: {
      _id: "$categoria_id",
      precio_promedio: { $avg: "$precio" },
      precio_maximo: { $max: "$precio" },
      precio_minimo: { $min: "$precio" }
  } },
  { $lookup: { from: "categorias", localField: "_id", foreignField: "_id", as: "categoria" } },
  { $project: { _id: 0, categoria: { $first: "$categoria.nombre" }, precio_promedio: { $round: ["$precio_promedio", 0] }, precio_maximo: 1, precio_minimo: 1 } },
  { $sort: { precio_promedio: -1 } }
])

// Ticket promedio de los pedidos
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: {
      _id: null,
      ticket_promedio: { $avg: "$total" },
      pedido_mayor: { $max: "$total" },
      pedido_menor: { $min: "$total" }
  } },
  { $project: { _id: 0, ticket_promedio: { $round: ["$ticket_promedio", 0] }, pedido_mayor: 1, pedido_menor: 1 } }
])

// Calificación promedio de reseñas por categoría
db.productos.aggregate([
  { $unwind: "$resenas" },
  { $group: {
      _id: "$categoria_id",
      calificacion_promedio: { $avg: "$resenas.puntuacion" },
      cantidad_resenas: { $sum: 1 }
  } },
  { $lookup: { from: "categorias", localField: "_id", foreignField: "_id", as: "categoria" } },
  { $project: { _id: 0, categoria: { $first: "$categoria.nombre" }, calificacion_promedio: { $round: ["$calificacion_promedio", 2] }, cantidad_resenas: 1 } },
  { $sort: { calificacion_promedio: -1 } }
])

// Ventas por mes
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: {
      _id: { $month: "$fecha" },
      pedidos: { $sum: 1 },
      total_vendido: { $sum: "$total" },
      ticket_promedio: { $avg: "$total" }
  } },
  { $project: { _id: 0, mes: "$_id", pedidos: 1, total_vendido: 1, ticket_promedio: { $round: ["$ticket_promedio", 0] } } },
  { $sort: { mes: 1 } }
])
