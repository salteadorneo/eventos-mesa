#!/usr/bin/env node

/**
 * Script de prueba para el servidor MCP
 */

import { spawn } from 'child_process';

async function testMCPServer() {
  console.log("🧪 Iniciando pruebas del servidor MCP...\n");

  const serverProcess = spawn('node', ['server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  
  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    console.log('📟 Servidor:', data.toString().trim());
  });

  // Función para enviar mensaje al servidor
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 5000);

      const initialOutputLength = serverOutput.length;
      
      serverProcess.stdin.write(JSON.stringify(message) + '\n');
      
      // Verificar respuesta
      const checkResponse = () => {
        const newOutput = serverOutput.slice(initialOutputLength);
        if (newOutput.trim()) {
          clearTimeout(timeout);
          try {
            const response = JSON.parse(newOutput.trim().split('\n')[0]);
            resolve(response);
          } catch (e) {
            reject(e);
          }
        } else {
          setTimeout(checkResponse, 100);
        }
      };
      
      setTimeout(checkResponse, 100);
    });
  }

  try {
    // Esperar a que el servidor inicie
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Inicialización
    console.log("1️⃣ Probando inicialización...");
    const initResponse = await sendMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    });
    
    if (initResponse.result && initResponse.result.serverInfo) {
      console.log("✅ Inicialización exitosa");
      console.log(`   Servidor: ${initResponse.result.serverInfo.name} v${initResponse.result.serverInfo.version}`);
    } else {
      console.log("❌ Error en inicialización");
      console.log("   Respuesta:", initResponse);
    }

    // Test 2: Listar recursos
    console.log("\n2️⃣ Probando listado de recursos...");
    const resourcesResponse = await sendMessage({
      jsonrpc: "2.0",
      id: 2,
      method: "resources/list",
      params: {}
    });
    
    if (resourcesResponse.result && resourcesResponse.result.resources) {
      console.log(`✅ Recursos encontrados: ${resourcesResponse.result.resources.length}`);
      resourcesResponse.result.resources.forEach(resource => {
        console.log(`   - ${resource.name}: ${resource.uri}`);
      });
    } else {
      console.log("❌ Error listando recursos");
    }

    // Test 3: Listar herramientas
    console.log("\n3️⃣ Probando listado de herramientas...");
    const toolsResponse = await sendMessage({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/list",
      params: {}
    });
    
    if (toolsResponse.result && toolsResponse.result.tools) {
      console.log(`✅ Herramientas encontradas: ${toolsResponse.result.tools.length}`);
      toolsResponse.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log("❌ Error listando herramientas");
    }

    // Test 4: Probar herramienta
    console.log("\n4️⃣ Probando herramienta de estadísticas...");
    const statsResponse = await sendMessage({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "estadisticas_eventos",
        arguments: {}
      }
    });
    
    if (statsResponse.result && statsResponse.result.content) {
      console.log("✅ Estadísticas obtenidas exitosamente");
      const stats = JSON.parse(statsResponse.result.content[0].text);
      console.log(`   Total de eventos: ${stats.totalEvents}`);
      console.log(`   Próximos eventos: ${stats.upcomingEvents}`);
    } else {
      console.log("❌ Error obteniendo estadísticas");
      console.log("   Respuesta:", statsResponse);
    }

    console.log("\n🎉 Pruebas completadas!");

  } catch (error) {
    console.error("❌ Error durante las pruebas:", error.message);
  } finally {
    serverProcess.kill();
  }
}

testMCPServer().catch(console.error);
