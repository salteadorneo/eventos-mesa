#!/usr/bin/env node

/**
 * Script de configuración para Claude Desktop
 * Genera la configuración necesaria para usar el servidor MCP
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getClaudeConfigPath() {
  const homeDir = homedir();
  
  // Rutas típicas para Claude Desktop
  const possiblePaths = [
    join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'), // Windows
    join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'), // macOS
    join(homeDir, '.config', 'claude', 'claude_desktop_config.json'), // Linux
  ];
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  // Si no existe, usar la ruta de Windows por defecto
  return possiblePaths[0];
}

function generateConfig() {
  const serverPath = join(__dirname, 'server.js');
  
  const config = {
    mcpServers: {
      "agendados": {
        command: "node",
        args: [serverPath],
        env: {}
      }
    }
  };
  
  return config;
}

function updateClaudeConfig() {
  const configPath = getClaudeConfigPath();
  const newConfig = generateConfig();
  
  console.log("🔧 Configurando Claude Desktop...");
  console.log(`📁 Ruta de configuración: ${configPath}`);
  
  let existingConfig = {};
  
  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf8');
      existingConfig = JSON.parse(configContent);
      console.log("📄 Configuración existente encontrada");
    } catch (error) {
      console.log("⚠️  Error leyendo configuración existente, creando nueva");
    }
  }
  
  // Fusionar configuraciones
  const mergedConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      ...newConfig.mcpServers
    }
  };
  
  try {
    writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
    console.log("✅ Configuración de Claude Desktop actualizada");
    console.log("🔄 Reinicia Claude Desktop para aplicar los cambios");
  } catch (error) {
    console.error("❌ Error escribiendo configuración:", error.message);
    console.log("\n📋 Configuración manual:");
    console.log("Añade esto a tu claude_desktop_config.json:");
    console.log(JSON.stringify(newConfig, null, 2));
  }
}

function showInstructions() {
  console.log(`
🎯 Servidor MCP de Agendados configurado

📖 Instrucciones de uso:

1️⃣ **Para Claude Desktop:**
   - Ejecuta: node setup-claude.js
   - Reinicia Claude Desktop
   - Usa comandos como: "Busca eventos de rol en Madrid"

2️⃣ **Para uso directo:**
   - Ejecuta: node server.js
   - Envía mensajes JSON por stdin

3️⃣ **Para desarrollo:**
   - Pruebas: npm test
   - API web: https://agendados.es/api/mcp

🔗 **Capacidades disponibles:**
   • Buscar eventos por texto
   • Filtrar por provincia/etiqueta/fecha
   • Obtener estadísticas
   • Generar resúmenes y recomendaciones

📚 Ver README.md para más detalles
`);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'claude':
      updateClaudeConfig();
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showInstructions();
      if (command === 'claude') {
        updateClaudeConfig();
      }
  }
}
