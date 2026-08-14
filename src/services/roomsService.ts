import { Room } from '../types';
import { ApiClient } from './api';

// As 3 salas fixas da SEPLAN
export const SEPLAN_ROOMS: Room[] = [
  {
    id: 'room-seplan-01',
    name: 'Sala de Reunião 1 (Executiva)',
    capacity: 12,
    location: 'SEPLAN - Ala A (Prédio Sede)',
    description: 'Sala executiva com mesa principal de 12 lugares, tela TV 65" 4K para videoconferências e quadro branco de vidro.',
    color: '#002B5C', // Azul Marinho TJPA
    equipment: ['Smart TV 65"', 'Videoconferência Teams/Zoom', 'Quadro Branco', 'Climatização'],
  },
  {
    id: 'room-seplan-02',
    name: 'Sala de Reunião 2 (Técnica)',
    capacity: 8,
    location: 'SEPLAN - Ala B (Planejamento)',
    description: 'Ambiente focado em alinhamentos técnicos e revisões de orçamentos/cronogramas, mesa redonda para 8 pessoas.',
    color: '#059669', // Esmeralda / Técnico
    equipment: ['Smart TV 55"', 'Mesa Redonda', 'Pontos de Rede Gigabit', 'Quadro Magnético'],
  },
  {
    id: 'room-seplan-03',
    name: 'Sala de Reunião 3 (Plenária / Brainstorming)',
    capacity: 16,
    location: 'SEPLAN - Ala Central',
    description: 'Espaço amplo com layout modular, projetor laser de alta definição e sistema integrado de áudio estéreo.',
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
