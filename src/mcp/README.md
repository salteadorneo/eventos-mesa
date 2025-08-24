# Agendados MCP Server

Un servidor MCP (Model Context Protocol) para interactuar con eventos de juegos de mesa desde https://agendados.es

## Características

Este servidor MCP permite a los asistentes de IA acceder y consultar información sobre eventos de juegos de mesa, incluyendo:

- 📅 **Recursos**: Acceso a todos los eventos, próximos eventos, provincias y etiquetas
- 🔧 **Herramientas**: Búsqueda, filtrado por provincia/etiqueta/fecha, y estadísticas
- 💬 **Prompts**: Generación de resúmenes de eventos y recomendaciones personalizadas

## Instalación

No requiere instalación de dependencias adicionales. Solo necesitas Node.js (versión 18 o superior).

```bash
cd src/mcp
chmod +x server.js
```

## Uso

### Ejecución directa
```bash
node server.js
```

### Como comando
```bash
npm link
agendados-mcp
```

### Pruebas
```bash
npm test
```

## Recursos disponibles

| URI | Descripción |
|-----|-------------|
| `eventos://all` | Lista completa de todos los eventos |
| `eventos://upcoming` | Solo eventos futuros |
| `eventos://provinces` | Lista de provincias con eventos |
| `eventos://tags` | Lista de todas las etiquetas |

## Herramientas disponibles

### 🔍 buscar_eventos
Busca eventos por texto en título, descripción o ubicación.
```json
{
  "query": "texto a buscar"
}
```

### 🗺️ eventos_por_provincia
Filtra eventos por provincia.
```json
{
  "provincia": "Madrid"
}
```

### 🏷️ eventos_por_tag
Filtra eventos por etiqueta.
```json
{
  "tag": "Juegos de mesa"
}
```

### 📅 eventos_por_fecha
Obtiene eventos en un rango de fechas.
```json
{
  "fechaInicio": "2025-08-01",
  "fechaFin": "2025-08-31"
}
```

### 📊 estadisticas_eventos
Obtiene estadísticas generales de los eventos.
```json
{}
```

## Prompts disponibles

### 📝 resumen_evento
Genera un resumen detallado de un evento específico.
```json
{
  "eventoId": "id-del-evento"
}
```

### 🎯 recomendaciones_eventos
Recomienda eventos basados en preferencias del usuario.
```json
{
  "preferencias": "Me gustan los juegos de estrategia en Madrid"
}
```

## Configuración para Claude Desktop

Para usar con Claude Desktop, añade esta configuración a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agendados": {
      "command": "node",
      "args": ["/ruta/completa/a/agendados/src/mcp/server.js"],
      "env": {}
    }
  }
}
```

## API utilizada

El servidor consume la API REST de agendados.es:
- **Endpoint**: `https://agendados.es/api/eventos`
- **Método**: GET
- **Formato**: JSON

## Estructura de datos

Cada evento tiene la siguiente estructura:
```json
{
  "id": "string",
  "data": {
    "title": "string",
    "description": "string", 
    "start": "2025-08-24",
    "end": "2025-08-25",
    "location": "string",
    "province": "string",
    "tags": ["array", "of", "strings"],
    "url": "https://example.com",
    "color": "#hexcolor"
  }
}
```

## Desarrollo

### Estructura del proyecto
```
src/mcp/
├── server.js          # Servidor MCP principal
├── events-service.js  # Servicio para consultar eventos
├── test-server.js     # Script de pruebas
├── package.json       # Configuración del paquete
└── README.md         # Esta documentación
```

### Protocolo MCP

El servidor implementa el protocolo MCP 2024-11-05 con las siguientes capacidades:
- **Resources**: Acceso a datos estructurados
- **Tools**: Funciones ejecutables
- **Prompts**: Plantillas para interacción con LLMs

## Ejemplos de uso

### Buscar eventos de rol en Madrid
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buscar_eventos","arguments":{"query":"rol Madrid"}}}' | node server.js
```

### Obtener estadísticas
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"estadisticas_eventos","arguments":{}}}' | node server.js
```

## Limitaciones

- Depende de la disponibilidad de la API de agendados.es
- No mantiene caché local de eventos
- Las búsquedas son case-insensitive pero exactas

## Licencia

MIT - Ver archivo LICENSE para más detalles.
