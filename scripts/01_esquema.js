// =====================================================================
// 01 - Diseño del esquema: base de datos y colecciones con validación
// Ejecutar en mongosh
// =====================================================================

db = db.getSiblingDB("tienda_productos")

// --- Colección categorias -------------------------------------------
db.createCollection("categorias", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["_id", "nombre", "activa"],
    properties: {
      _id: { bsonType: "string" },
      nombre: { bsonType: "string" },
      descripcion: { bsonType: "string" },
      activa: { bsonType: "bool" }
    }
  }}
})

// --- Colección proveedores ------------------------------------------
db.createCollection("proveedores", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["_id", "nombre", "nit", "pais", "ciudad", "contacto", "activo"],
    properties: {
      _id: { bsonType: "string" },
      nombre: { bsonType: "string" },
      nit: { bsonType: "string" },
      pais: { bsonType: "string" },
      ciudad: { bsonType: "string" },
      contacto: {
        bsonType: "object",
        required: ["nombre", "email"],
        properties: {
          nombre: { bsonType: "string" },
          email: { bsonType: "string" },
          telefono: { bsonType: "string" }
        }
      },
      activo: { bsonType: "bool" }
    }
  }}
})

// --- Colección productos --------------------------------------------
db.createCollection("productos", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["_id", "sku", "nombre", "marca", "categoria_id", "proveedor_id", "precio", "stock", "activo", "fecha_creacion"],
    properties: {
      _id: { bsonType: "string" },
      sku: { bsonType: "string" },
      nombre: { bsonType: "string" },
      marca: { bsonType: "string" },
      categoria_id: { bsonType: "string" },
      proveedor_id: { bsonType: "string" },
      precio: { bsonType: "number", minimum: 0 },
      stock: { bsonType: "number", minimum: 0 },
      especificaciones: { bsonType: "object" },
      etiquetas: { bsonType: "array", items: { bsonType: "string" } },
      resenas: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["usuario", "puntuacion"],
          properties: {
            usuario: { bsonType: "string" },
            puntuacion: { bsonType: "number", minimum: 1, maximum: 5 },
            comentario: { bsonType: "string" },
            fecha: { bsonType: "date" }
          }
        }
      },
      activo: { bsonType: "bool" },
      fecha_creacion: { bsonType: "date" }
    }
  }}
})

// --- Colección pedidos ----------------------------------------------
db.createCollection("pedidos", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["_id", "fecha", "cliente", "items", "total", "estado", "metodo_pago"],
    properties: {
      _id: { bsonType: "string" },
      fecha: { bsonType: "date" },
      cliente: {
        bsonType: "object",
        required: ["nombre", "email", "ciudad"],
        properties: {
          nombre: { bsonType: "string" },
          email: { bsonType: "string" },
          ciudad: { bsonType: "string" }
        }
      },
      items: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["producto_id", "cantidad", "precio_unitario"],
          properties: {
            producto_id: { bsonType: "string" },
            cantidad: { bsonType: "number", minimum: 1 },
            precio_unitario: { bsonType: "number", minimum: 0 }
          }
        }
      },
      total: { bsonType: "number", minimum: 0 },
      estado: { enum: ["pendiente", "enviado", "entregado", "cancelado"] },
      metodo_pago: { enum: ["tarjeta", "PSE", "efectivo", "transferencia"] }
    }
  }}
})

db.getCollectionNames()

// --- Verificación del esquema ---------------------------------------
// Ver el validador guardado
db.getCollectionInfos({ name: "productos" })[0].options.validator

// Documento incompleto (sin "activa"): debe fallar con "Document failed validation"
db.categorias.insertOne({ _id: "PRUEBA", nombre: "Categoría de prueba" })

// Confirmar que no se guardó nada (resultado esperado: 0)
db.categorias.countDocuments()
