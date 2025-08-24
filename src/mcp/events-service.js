/**
 * Servicio para manejar eventos de juegos de mesa
 * Compatible con Node.js sin dependencias de Astro
 */

export class EventsService {
  constructor(baseUrl = "https://agendados.es") {
    this.baseUrl = baseUrl;
  }

  async getAllEvents() {
    try {
      const response = await fetch(`${this.baseUrl}/api/eventos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async getUpcomingEvents() {
    const events = await this.getAllEvents();
    const now = new Date();
    return events.filter(event => new Date(event.data.start) >= now);
  }

  async getEventById(id) {
    const events = await this.getAllEvents();
    return events.find(event => event.id === id) || null;
  }

  async searchEvents(query) {
    const events = await this.getAllEvents();
    const searchTerm = query.toLowerCase();
    return events.filter(event => 
      event.data.title.toLowerCase().includes(searchTerm) ||
      event.data.description.toLowerCase().includes(searchTerm) ||
      event.data.location?.toLowerCase().includes(searchTerm) ||
      event.data.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  async getEventsByProvince(province) {
    const events = await this.getAllEvents();
    return events.filter(event => 
      event.data.province?.toLowerCase() === province.toLowerCase()
    );
  }

  async getEventsByTag(tag) {
    const events = await this.getAllEvents();
    return events.filter(event => 
      event.data.tags?.some(eventTag => 
        eventTag.toLowerCase() === tag.toLowerCase()
      )
    );
  }

  async getEventsByDateRange(startDate, endDate) {
    const events = await this.getAllEvents();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return events.filter(event => {
      const eventStart = new Date(event.data.start);
      const eventEnd = event.data.end ? new Date(event.data.end) : eventStart;
      
      return (eventStart >= start && eventStart <= end) ||
             (eventEnd >= start && eventEnd <= end) ||
             (eventStart <= start && eventEnd >= end);
    });
  }

  async getProvinces() {
    const events = await this.getAllEvents();
    const provinces = new Set();
    events.forEach(event => {
      if (event.data.province) {
        provinces.add(event.data.province);
      }
    });
    return Array.from(provinces).sort();
  }

  async getTags() {
    const events = await this.getAllEvents();
    const tags = new Set();
    events.forEach(event => {
      event.data.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  async getEventStatistics() {
    const events = await this.getAllEvents();
    const now = new Date();
    
    const upcomingEvents = events.filter(event => new Date(event.data.start) >= now);
    
    const eventsByProvince = {};
    const eventsByTag = {};
    const eventsByMonth = {};
    
    events.forEach(event => {
      // Por provincia
      if (event.data.province) {
        eventsByProvince[event.data.province] = (eventsByProvince[event.data.province] || 0) + 1;
      }
      
      // Por etiqueta
      event.data.tags?.forEach(tag => {
        eventsByTag[tag] = (eventsByTag[tag] || 0) + 1;
      });
      
      // Por mes
      const month = event.data.start.substring(0, 7); // YYYY-MM
      eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
    });
    
    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      eventsByProvince,
      eventsByTag,
      eventsByMonth
    };
  }
}
