// =====================================================================
// 04 - Consultas con filtros, operadores y join ($lookup)
// =====================================================================

db = db.getSiblingDB("tienda_productos")

// ---------------------------------------------------------------------
// OPERADORES DE COMPARACIÓN Y LÓGICOS
// ---------------------------------------------------------------------
// $gte / $lte: rango de precios (12 productos)
db.productos.find(
  { precio: { $gte: 500000, $lte: 1500000 } },
  { _id: 0, nombre: 1, precio: 1 }
).sort({ precio: 1 })
db.productos.countDocuments({ precio: { $gte: 500000, $lte: 1500000 } })

// $in: lista de valores (7 productos)
db.productos.find(
  { marca: { $in: ["Samsung", "Sony"] } },
  { _id: 0, nombre: 1, marca: 1, precio: 1 }
)
db.productos.countDocuments({ marca: { $in: ["Samsung", "Sony"] } })

// $or: sin stock o desactivados (5 productos)
db.productos.find(
  { $or: [ { stock: 0 }, { activo: false } ] },
  { _id: 0, nombre: 1, stock: 1, activo: 1 }
)
db.productos.countDocuments({ $or: [ { stock: 0 }, { activo: false } ] })

// $and con $gt y $lt: activos con pocas unidades (11 productos)
db.productos.find(
  { $and: [ { activo: true }, { stock: { $gt: 0, $lt: 10 } } ] },
  { _id: 0, nombre: 1, stock: 1 }
).sort({ stock: 1 })
db.productos.countDocuments({ $and: [ { activo: true }, { stock: { $gt: 0, $lt: 10 } } ] })

// $nin: excluir estados (27 pedidos)
db.pedidos.find(
  { estado: { $nin: ["cancelado", "pendiente"] } },
  { _id: 1, estado: 1, total: 1 }
)
db.pedidos.countDocuments({ estado: { $nin: ["cancelado", "pendiente"] } })

// $gt: pedidos mayores a 2.000.000 (10 pedidos)
db.pedidos.find(
  { total: { $gt: 2000000 } },
  { _id: 1, "cliente.nombre": 1, total: 1 }
).sort({ total: -1 })
db.pedidos.countDocuments({ total: { $gt: 2000000 } })

// ---------------------------------------------------------------------
// OPERADORES SOBRE ARREGLOS, SUBDOCUMENTOS Y TEXTO
// ---------------------------------------------------------------------
// $all: el arreglo contiene todos los valores (2 productos)
db.productos.find(
  { etiquetas: { $all: ["bluetooth", "economico"] } },
  { _id: 0, nombre: 1, etiquetas: 1 }
)

// $size: productos sin reseñas (24)
db.productos.countDocuments({ resenas: { $size: 0 } })

// $elemMatch: al menos una reseña de 3 estrellas o menos (3 productos)
db.productos.find(
  { resenas: { $elemMatch: { puntuacion: { $lte: 3 } } } },
  { _id: 0, nombre: 1, "resenas.puntuacion": 1, "resenas.comentario": 1 }
)

// Notación con punto en subdocumento: 8 GB de RAM o más (5 productos)
db.productos.find(
  { "especificaciones.ram_gb": { $gte: 8 } },
  { _id: 0, nombre: 1, "especificaciones.ram_gb": 1 }
)

// $exists: productos con el campo garantia_meses (3)
db.productos.find(
  { garantia_meses: { $exists: true } },
  { _id: 0, nombre: 1, garantia_meses: 1 }
)

// $regex: nombre empieza por "tenis" (3 productos)
db.productos.find(
  { nombre: { $regex: "^tenis", $options: "i" } },
  { _id: 0, nombre: 1, precio: 1 }
)

// Campo dentro de un arreglo de subdocumentos (10 pedidos)
db.pedidos.countDocuments({ "items.cantidad": { $gte: 3 } })

// ---------------------------------------------------------------------
// JOIN CON $lookup
// ---------------------------------------------------------------------
// Productos con el nombre de su categoría
db.productos.aggregate([
  { $match: { _id: { $in: ["PRD001", "PRD019", "PRD037"] } } },
  { $lookup: { from: "categorias", localField: "categoria_id", foreignField: "_id", as: "categoria" } },
  { $unwind: "$categoria" },
  { $project: { _id: 0, nombre: 1, precio: 1, categoria: "$categoria.nombre" } }
])

// Doble join: producto + categoría + proveedor
db.productos.aggregate([
  { $match: { _id: { $in: ["PRD001", "PRD019", "PRD037"] } } },
  { $lookup: { from: "categorias", localField: "categoria_id", foreignField: "_id", as: "categoria" } },
  { $lookup: { from: "proveedores", localField: "proveedor_id", foreignField: "_id", as: "proveedor" } },
  { $unwind: "$categoria" },
  { $unwind: "$proveedor" },
  { $project: { _id: 0, nombre: 1, categoria: "$categoria.nombre", proveedor: "$proveedor.nombre", ciudad_proveedor: "$proveedor.ciudad" } }
])

// Join con filtro sobre la colección unida: proveedores de Perú (6 productos)
db.productos.aggregate([
  { $lookup: { from: "proveedores", localField: "proveedor_id", foreignField: "_id", as: "proveedor" } },
  { $unwind: "$proveedor" },
  { $match: { "proveedor.pais": "Perú" } },
  { $project: { _id: 0, nombre: 1, proveedor: "$proveedor.nombre", pais: "$proveedor.pais" } }
])

// Pedido con el detalle de sus productos
db.pedidos.aggregate([
  { $match: { _id: "PED0001" } },
  { $lookup: { from: "productos", localField: "items.producto_id", foreignField: "_id", as: "detalle_productos" } },
  { $project: { _id: 1, "cliente.nombre": 1, total: 1, "detalle_productos.nombre": 1, "detalle_productos.marca": 1 } }
])

// Cantidad de productos por categoría
db.categorias.aggregate([
  { $lookup: { from: "productos", localField: "_id", foreignField: "categoria_id", as: "productos" } },
  { $project: { _id: 0, categoria: "$nombre", total_productos: { $size: "$productos" } } }
])
