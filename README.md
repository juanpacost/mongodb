# Base de datos NoSQL en MongoDB: catálogo y ventas de una tienda en línea

Trabajo de la **Fase 2 – MongoDB** del curso **Big Data (202016911)**, Universidad Nacional Abierta y a Distancia (UNAD).

La base de datos `tienda_productos` registra el catálogo y las ventas de una tienda en línea con productos de 10 categorías. Contiene 4 colecciones con validación `$jsonSchema` y 120 documentos de prueba.

## Entorno

- MongoDB Community Server 9.0.4
- mongosh 2.14.1
- MongoDB Compass

## Estructura de la base de datos

| Colección | Campos | Documentos |
|---|---|---|
| `categorias` | `_id`, `nombre`, `descripcion`, `activa` | 10 |
| `proveedores` | `_id`, `nombre`, `nit`, `pais`, `ciudad`, `contacto {nombre, email, telefono}`, `activo` | 10 |
| `productos` | `_id`, `sku`, `nombre`, `marca`, `categoria_id`, `proveedor_id`, `precio`, `stock`, `especificaciones {}`, `etiquetas []`, `resenas [{usuario, puntuacion, comentario, fecha}]`, `activo`, `fecha_creacion` | 60 |
| `pedidos` | `_id`, `fecha`, `cliente {nombre, email, ciudad}`, `items [{producto_id, cantidad, precio_unitario}]`, `total`, `estado`, `metodo_pago` | 40 |

Relaciones:

```
categorias (1) ──< productos (N)
proveedores (1) ──< productos (N)
productos (1) ──< pedidos.items (N)
```

## Scripts

Ejecútalos en orden desde `mongosh` o desde la consola integrada de MongoDB Compass.

| Archivo | Contenido |
|---|---|
| `scripts/01_esquema.js` | Creación de la base de datos y de las 4 colecciones con su validador `$jsonSchema`, y prueba de rechazo de un documento inválido |
| `scripts/02_datos_prueba.js` | Inserción de los 120 documentos de prueba y conteo por colección |
| `scripts/03_crud.js` | Inserción, selección, actualización y eliminación |
| `scripts/04_filtros_y_join.js` | Operadores de comparación, lógicos, de arreglos y de texto; uniones con `$lookup` |
| `scripts/05_agregacion.js` | Conteos, sumas, promedios, máximos y mínimos con el marco de agregación |

Para ejecutar un archivo completo desde la terminal:

```bash
mongosh scripts/01_esquema.js
```

> Cada archivo selecciona la base de datos con `db = db.getSiblingDB("tienda_productos")`, que funciona igual en la consola interactiva y al ejecutar el archivo completo. Para ver el resultado de cada consulta, pega los bloques uno por uno en la consola: al ejecutar un archivo completo, mongosh no imprime los resultados intermedios.

## Resultados principales

- Ingreso total: 42.265.400 en 35 pedidos válidos
- Ticket promedio: 1.207.583
- Mes con más ventas: octubre (16.948.000)
- Categoría con mayor valor de inventario: Celulares y tablets (133.599.000)

Los datos son ficticios y se crearon para este ejercicio.
