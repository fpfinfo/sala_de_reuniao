import { Room } from '../types';
import { ApiClient } from './api';

// As 3 salas fixas da SEPLAN
export const SEPLAN_ROOMS: Room[] = [
  {
    id: 'room-seplan-01',
    name: 'Sala de Reunião 1 (CODAR)',
    capacity: 12,
    location: 'SEPLAN - Ala CODAR (Prédio Sede)',
    description: 'Sala de reuniões da Coordenadoria de Arrecadação (CODAR) equipada com TV 65" 4K para videoconferências e quadro branco.',
    color: '#002B5C', // Azul Marinho TJPA
    equipment: ['Smart TV 65"', 'Videoconferência Teams/Zoom', 'Quadro Branco', 'Climatização'],
  },
  {
    id: 'room-seplan-02',
    name: 'Sala de Reunião 2 (SEPLAN)',
    capacity: 8,
    location: 'SEPLAN - Gabinete / Planejamento',
    description: 'Sala central da Secretaria de Planejamento, Coordenação e Finanças para alinhamentos estratégicos e técnicos.',
    color: '#059669', // Esmeralda / Técnico
    equipment: ['Smart TV 55"', 'Mesa Redonda', 'Pontos de Rede Gigabit', 'Quadro Magnético'],
  },
  {
    id: 'room-seplan-03',
    name: 'Sala de Reunião 3 (COFIN)',
    capacity: 16,
    location: 'SEPLAN - Ala COFIN (Finanças)',
    description: 'Espaço da Coordenadoria Financeira (COFIN) com layout amplo, projetor de alta definição e sistema integrado de áudio.',
    color: '#C59B27', // Dourado Ouro TJPA
    equipment: ['Projetor Laser', 'Sistema de Áudio', 'Mesas Modulares', 'Flipchart'],
  },
];

export const roomsService = {
  /**
   * Obtém a lista das 3 salas da SEPLAN
   */
  async getRooms(): Promise<Room[]> {
    try {
      const rooms = await ApiClient.request<Room[]>('/rooms');
      return rooms && rooms.length > 0 ? rooms : SEPLAN_ROOMS;
    } catch (error) {
      // Fallback para salas oficiais pré-configuradas da SEPLAN
      return SEPLAN_ROOMS;
    }
  },

  /**
   * Obtém uma sala por ID
   */
  async getRoomById(id: string): Promise<Room | undefined> {
    const rooms = await this.getRooms();
    return rooms.find((r) => r.id === id);
  },
};
