# Agendados - Servidor MCP

Este proyecto ahora incluye un **servidor MCP (Model Context Protocol)** que permite a los LLMs interactuar directamente con la información de eventos de juegos de mesa.

## 🆕 Nueva funcionalidad: MCP Server

### ¿Qué es un servidor MCP?

Un servidor MCP permite que los LLMs como Claude accedan a recursos externos de forma estructurada. En este caso, pueden consultar, buscar y analizar eventos de juegos de mesa en tiempo real.

### 📁 Ubicación del servidor

```
src/mcp/
├── server.js           # 🖥️ Servidor MCP principal
├── events-service.js   # 🔧 Servicio para consultar eventos  
├── test-server.js      # 🧪 Script de pruebas
├── setup-claude.js     # ⚙️ Configuración para Claude Desktop
├── package.json        # 📦 Configuración del paquete
└── README.md          # 📚 Documentación detallada
```

## 🚀 Inicio rápido

### 1. Probar el servidor
```bash
cd src/mcp
npm test
```

### 2. Configurar Claude Desktop
```bash
cd src/mcp
npm run setup-claude
```

### 3. Usar desde Claude Desktop
Después de reiniciar Claude Desktop, puedes usar comandos como:
- "Busca eventos de rol en Madrid"
- "¿Qué eventos hay este fin de semana?"
- "Muéstrame estadísticas de eventos por provincia"

## 🛠️ Capacidades del servidor

### 📋 Recursos disponibles
- **eventos://all** - Todos los eventos
- **eventos://upcoming** - Próximos eventos
- **eventos://provinces** - Provincias con eventos
- **eventos://tags** - Etiquetas disponibles

### 🔧 Herramientas
- **buscar_eventos** - Búsqueda por texto
- **eventos_por_provincia** - Filtrar por provincia
- **eventos_por_tag** - Filtrar por etiqueta
- **eventos_por_fecha** - Filtrar por rango de fechas
- **estadisticas_eventos** - Estadísticas generales

### 💬 Prompts inteligentes
- **resumen_evento** - Resumen detallado de un evento
- **recomendaciones_eventos** - Recomendaciones personalizadas

## 🌐 Integración con la web

### API REST existente
- **GET** `/api/eventos` - Lista todos los eventos (ya existía)

### Nueva API MCP
- **POST** `/api/mcp` - Proxy para el servidor MCP

## 🔧 Tecnologías utilizadas

- **Node.js** - Runtime para el servidor MCP
- **Astro** - Framework web principal
- **Model Context Protocol** - Protocolo de comunicación con LLMs
- **Fetch API** - Consumo de la API REST existente

## 📊 Ejemplo de uso

```javascript
// Mensaje MCP para buscar eventos
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "buscar_eventos",
    "arguments": {
      "query": "Alter Paradox"
    }
  }
}
```

## 🎯 Beneficios

1. **Para desarrolladores**: API estructurada para integrar con LLMs
2. **Para usuarios**: Consultas en lenguaje natural sobre eventos
3. **Para el proyecto**: Mayor visibilidad y accesibilidad de los datos

## 🔗 Enlaces útiles

- [Documentación MCP](src/mcp/README.md)
- [API REST](http://localhost:4321/api/eventos)
- [Web principal](http://localhost:4321)

## 🧪 Estado de las pruebas

El servidor MCP ha sido probado y funciona correctamente:
- ✅ Inicialización
- ✅ Listado de recursos
- ✅ Listado de herramientas  
- ✅ Ejecución de herramientas
- ✅ Obtención de estadísticas

---

*Ahora tu proyecto de eventos de mesa es compatible con IA! 🤖✨*
