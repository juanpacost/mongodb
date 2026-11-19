// =====================================================================
// 03 - Consultas básicas (CRUD): inserción, selección, actualización
//      y eliminación
// =====================================================================

db = db.getSiblingDB("tienda_productos")

// ---------------------------------------------------------------------
// INSERCIÓN
// ---------------------------------------------------------------------
db.productos.insertOne({
  _id: "PRD061",
  sku: "COM-WEB-001",
  nombre: "Cámara web Logitech C920 Full HD",
  marca: "Logitech",
  categoria_id: "CAT01",
  proveedor_id: "PRV01",
  precio: 299000,
  stock: 20,
  especificaciones: { resolucion: "1080p", fps: 30, microfono: true, conexion: "USB" },
  etiquetas: ["camara web", "videollamadas", "oficina"],
  resenas: [],
  activo: true,
  fecha_creacion: new Date()
})

db.productos.findOne({ _id: "PRD061" })
db.productos.countDocuments()                      // 61

// ---------------------------------------------------------------------
// SELECCIÓN
// ---------------------------------------------------------------------
// Proyección: solo nombre y precio
db.productos.find({}, { _id: 0, nombre: 1, precio: 1 }).limit(10)

// Igualdad exacta (4 productos)
db.productos.find({ marca: "Apple" }, { nombre: 1, precio: 1 })

// Ordenar y limitar: los 5 más caros
db.productos.find({}, { _id: 0, nombre: 1, precio: 1 }).sort({ precio: -1 }).limit(5)

// Campo dentro de un subdocumento (10 pedidos)
db.pedidos.find({ "cliente.ciudad": "Cali" }, { _id: 1, "cliente.nombre": 1, total: 1 })
db.pedidos.countDocuments({ "cliente.ciudad": "Cali" })

// ---------------------------------------------------------------------
// ACTUALIZACIÓN
// ---------------------------------------------------------------------
// $set: cambiar un valor
db.productos.updateOne({ _id: "PRD061" }, { $set: { precio: 279000 } })
db.productos.findOne({ _id: "PRD061" }, { nombre: 1, precio: 1 })

// $inc: sumar a un valor
db.productos.updateOne({ _id: "PRD006" }, { $inc: { stock: 25 } })
db.productos.findOne({ _id: "PRD006" }, { nombre: 1, stock: 1 })

// $push: agregar un elemento a un arreglo
db.productos.updateOne(
  { _id: "PRD061" },
  { $push: { resenas: { usuario: "miguel_u", puntuacion: 5, comentario: "Imagen muy nítida", fecha: new Date() } } }
)
db.productos.findOne({ _id: "PRD061" }, { nombre: 1, resenas: 1 })

// updateMany: varios documentos a la vez (3 productos Logitech)
db.productos.updateMany({ marca: "Logitech" }, { $set: { garantia_meses: 12 } })
db.productos.find({ marca: "Logitech" }, { _id: 0, nombre: 1, garantia_meses: 1 })

// ---------------------------------------------------------------------
// ELIMINACIÓN (sobre productos temporales)
// ---------------------------------------------------------------------
db.productos.insertMany([
  { _id: "TMP01", sku: "LIQ-001", nombre: "Cable USB-C genérico", marca: "Genérico", categoria_id: "CAT01", proveedor_id: "PRV01", precio: 15000, stock: 100,
    etiquetas: ["liquidacion"], resenas: [], activo: true, fecha_creacion: new Date() },
  { _id: "TMP02", sku: "LIQ-002", nombre: "Forro para celular genérico", marca: "Genérico", categoria_id: "CAT02", proveedor_id: "PRV02", precio: 12000, stock: 80,
    etiquetas: ["liquidacion"], resenas: [], activo: true, fecha_creacion: new Date() },
  { _id: "TMP03", sku: "LIQ-003", nombre: "Medias deportivas x3", marca: "Genérico", categoria_id: "CAT08", proveedor_id: "PRV08", precio: 25000, stock: 60,
    etiquetas: ["liquidacion"], resenas: [], activo: true, fecha_creacion: new Date() }
])
db.productos.countDocuments()                      // 64

db.productos.deleteOne({ _id: "TMP01" })           // deletedCount: 1
db.productos.deleteMany({ etiquetas: "liquidacion" }) // deletedCount: 2

db.productos.find({ _id: { $in: ["TMP01", "TMP02", "TMP03"] } }) // sin resultados
db.productos.countDocuments()                      // 61
