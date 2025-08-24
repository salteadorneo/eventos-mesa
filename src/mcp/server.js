#!/usr/bin/env node

/**
 * Servidor MCP (Model Context Protocol) para eventos de juegos de mesa
 * Sin dependencias externas - Solo Node.js nativo
 */

import { EventsService } from './events-service.js';

class EventosMCPServer {
  constructor() {
    this.eventsService = new EventsService();
  }

  async sendMessage(message) {
    const jsonMessage = JSON.stringify(message);
    process.stdout.write(jsonMessage + '\n');
  }

  async handleMessage(message) {
    try {
      if (!message.method) {
        return;
      }

      const response = {
        jsonrpc: "2.0",
        id: message.id,
      };

      switch (message.method) {
        case "initialize":
          response.result = {
            protocolVersion: "2024-11-05",
            capabilities: {
              resources: {},
              tools: {},
              prompts: {},
            },
            serverInfo: {
              name: "agendados-server",
              version: "0.1.0",
            },
          };
          break;

        case "notifications/initialized":
          // No response needed for notifications
          return;

        case "resources/list":
          response.result = {
            resources: [
              {
                uri: "eventos://all",
                mimeType: "application/json",
                name: "Todos los eventos",
                description: "Lista completa de eventos de juegos de mesa",
              },
              {
                uri: "eventos://upcoming",
                mimeType: "application/json",
                name: "Próximos eventos", 
                description: "Eventos que ocurrirán en el futuro",
              },
              {
                uri: "eventos://provinces",
                mimeType: "application/json",
                name: "Provincias",
                description: "Lista de provincias con eventos",
              },
              {
                uri: "eventos://tags",
                mimeType: "application/json",
                name: "Etiquetas",
                description: "Lista de todas las etiquetas disponibles",
              },
            ],
          };
          break;

        case "resources/read":
          const { uri } = message.params;
          let resourceData;

          switch (uri) {
            case "eventos://all":
              resourceData = await this.eventsService.getAllEvents();
              break;
            case "eventos://upcoming":
              resourceData = await this.eventsService.getUpcomingEvents();
              break;
            case "eventos://provinces":
              resourceData = await this.eventsService.getProvinces();
              break;
            case "eventos://tags":
              resourceData = await this.eventsService.getTags();
              break;
            default:
              throw new Error(`Recurso no encontrado: ${uri}`);
          }

          response.result = {
            contents: [{
              uri,
              mimeType: "application/json",
              text: JSON.stringify(resourceData, null, 2),
            }],
          };
          break;

        case "tools/list":
          response.result = {
            tools: [
              {
                name: "buscar_eventos",
                description: "Buscar eventos por texto en título o descripción",
                inputSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "Texto a buscar en eventos",
                    },
                  },
                  required: ["query"],
                },
              },
              {
                name: "eventos_por_provincia",
                description: "Obtener eventos de una provincia específica",
                inputSchema: {
                  type: "object",
                  properties: {
                    provincia: {
                      type: "string",
                      description: "Nombre de la provincia",
                    },
                  },
                  required: ["provincia"],
                },
              },
              {
                name: "eventos_por_tag",
                description: "Obtener eventos con una etiqueta específica",
                inputSchema: {
                  type: "object",
                  properties: {
                    tag: {
                      type: "string",
                      description: "Etiqueta a filtrar",
                    },
                  },
                  required: ["tag"],
                },
              },
              {
                name: "eventos_por_fecha",
                description: "Obtener eventos en un rango de fechas",
                inputSchema: {
                  type: "object",
                  properties: {
                    fechaInicio: {
                      type: "string",
                      description: "Fecha de inicio (YYYY-MM-DD)",
                    },
                    fechaFin: {
                      type: "string",
                      description: "Fecha de fin (YYYY-MM-DD)",
                    },
                  },
                  required: ["fechaInicio", "fechaFin"],
                },
              },
              {
                name: "estadisticas_eventos",
                description: "Obtener estadísticas generales de los eventos",
                inputSchema: {
                  type: "object",
                  properties: {},
                },
              },
            ],
          };
          break;

        case "tools/call":
          const { name, arguments: args } = message.params;
          let toolResult;

          switch (name) {
            case "buscar_eventos":
              toolResult = await this.eventsService.searchEvents(args.query);
              break;
            case "eventos_por_provincia":
              toolResult = await this.eventsService.getEventsByProvince(args.provincia);
              break;
            case "eventos_por_tag":
              toolResult = await this.eventsService.getEventsByTag(args.tag);
              break;
            case "eventos_por_fecha":
              toolResult = await this.eventsService.getEventsByDateRange(args.fechaInicio, args.fechaFin);
              break;
            case "estadisticas_eventos":
              toolResult = await this.eventsService.getEventStatistics();
              break;
            default:
              throw new Error(`Herramienta no encontrada: ${name}`);
          }

          response.result = {
            content: [{
              type: "text",
              text: JSON.stringify(toolResult, null, 2),
            }],
          };
          break;

        case "prompts/list":
          response.result = {
            prompts: [
              {
                name: "resumen_evento",
                description: "Generar un resumen detallado de un evento específico",
                arguments: [
                  {
                    name: "eventoId",
                    description: "ID del evento",
                    required: true,
                  },
                ],
              },
              {
                name: "recomendaciones_eventos",
                description: "Recomendar eventos basados en preferencias",
                arguments: [
                  {
                    name: "preferencias",
                    description: "Preferencias del usuario (ubicación, tipo de juego, etc.)",
                    required: true,
                  },
                ],
              },
            ],
          };
          break;

        case "prompts/get":
          const { name: promptName, arguments: promptArgs } = message.params;
          let promptResult;

          switch (promptName) {
            case "resumen_evento":
              const evento = await this.eventsService.getEventById(promptArgs?.eventoId);
              if (!evento) {
                throw new Error("Evento no encontrado");
              }
              
              promptResult = {
                description: `Resumen del evento: ${evento.data.title}`,
                messages: [
                  {
                    role: "user",
                    content: {
                      type: "text",
                      text: `Por favor, genera un resumen detallado del siguiente evento de juegos de mesa:

Título: ${evento.data.title}
Descripción: ${evento.data.description}
Fecha inicio: ${evento.data.start}
Fecha fin: ${evento.data.end || 'No especificada'}
Ubicación: ${evento.data.location || 'No especificada'}
Provincia: ${evento.data.province || 'No especificada'}
URL: ${evento.data.url || 'No disponible'}
Etiquetas: ${evento.data.tags?.join(', ') || 'Sin etiquetas'}

Incluye información sobre el tipo de evento, actividades principales, y cualquier detalle relevante para los asistentes.`,
                    },
                  },
                ],
              };
              break;

            case "recomendaciones_eventos":
              const allEvents = await this.eventsService.getUpcomingEvents();
              promptResult = {
                description: "Recomendaciones personalizadas de eventos",
                messages: [
                  {
                    role: "user",
                    content: {
                      type: "text",
                      text: `Basándote en las siguientes preferencias del usuario: "${promptArgs?.preferencias}"

Y en la siguiente lista de próximos eventos de juegos de mesa:

${JSON.stringify(allEvents.slice(0, 10), null, 2)}

Por favor, recomienda los 3-5 eventos más relevantes para el usuario, explicando por qué cada uno podría interesarle basándose en sus preferencias.`,
                    },
                  },
                ],
              };
              break;

            default:
              throw new Error(`Prompt no encontrado: ${promptName}`);
          }

          response.result = promptResult;
          break;

        default:
          response.error = {
            code: -32601,
            message: `Método no encontrado: ${message.method}`,
          };
      }

      await this.sendMessage(response);

    } catch (error) {
      const errorResponse = {
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Error interno del servidor",
          data: error instanceof Error ? error.stack : undefined,
        },
      };
      await this.sendMessage(errorResponse);
    }
  }

  async start() {
    console.error("Servidor MCP de Agendados iniciado");
    
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parseando mensaje JSON:", error);
          }
        }
      }
    });

    process.stdin.on('end', () => {
      console.error("Conexión cerrada");
      process.exit(0);
    });
  }
}

// Iniciar el servidor
const server = new EventosMCPServer();
server.start().catch((error) => {
  console.error("Error iniciando el servidor:", error);
  process.exit(1);
});
