import { Room } from '../types';
import { ApiClient } from './api';

const ROOMS_STORAGE_KEY = 'seplan_salas_rooms_config';

// As 3 salas fixas da SEPLAN com as capacidades oficiais atualizadas
export const DEFAULT_SEPLAN_ROOMS: Room[] = [
  {
    id: 'room-seplan-01',
    name: 'Sala de Reunião 1 (CODAR)',
    capacity: 10,
    location: 'SEPLAN - Ala CODAR (Prédio Sede)',
    description: 'Sala de reuniões da Coordenadoria de Arrecadação (CODAR) equipada com TV 65" 4K para videoconferências e quadro branco.',
    color: '#002B5C', // Azul Marinho TJPA
    equipment: ['Smart TV 65"', 'Videoconferência Teams/Zoom', 'Quadro Branco', 'Climatização'],
  },
  {
    id: 'room-seplan-02',
    name: 'Sala de Reunião 2 (SEPLAN)',
    capacity: 15,
    location: 'SEPLAN - Gabinete / Planejamento',
    description: 'Sala central da Secretaria de Planejamento, Coordenação e Finanças para alinhamentos estratégicos com o Secretário Geral e equipes.',
    color: '#059669', // Esmeralda / Técnico
    equipment: ['Smart TV 55"', 'Mesa Redonda e Cadeiras Executivas', 'Pontos de Rede Gigabit', 'Quadro Magnético'],
  },
  {
    id: 'room-seplan-03',
    name: 'Sala de Reunião 3 (COFIN)',
    capacity: 15,
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
      return rooms && rooms.length > 0 ? rooms : this.getLocalRooms();
    } catch (error) {
      return this.getLocalRooms();
    }
  },

  getLocalRooms(): Room[] {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(DEFAULT_SEPLAN_ROOMS));
      return DEFAULT_SEPLAN_ROOMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SEPLAN_ROOMS;
    }
  },

  saveLocalRooms(rooms: Room[]): void {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  },

  /**
   * Atualiza as configurações de uma sala (Exclusivo Master Admin)
   */
  async updateRoom(roomId: string, updatedData: Partial<Room>): Promise<Room> {
    const rooms = this.getLocalRooms();
    const index = rooms.findIndex((r) => r.id === roomId);
    if (index === -1) {
      throw new Error('Sala não encontrada.');
    }

    const updatedRoom = { ...rooms[index], ...updatedData };
    rooms[index] = updatedRoom;
    this.saveLocalRooms(rooms);

    try {
      await ApiClient.request(`/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      // Persistido localmente
    }

    return updatedRoom;
  },

  /**
   * Obtém uma sala por ID
   */
  async getRoomById(id: string): Promise<Room | undefined> {
    const rooms = await this.getRooms();
    return rooms.find((r) => r.id === id);
  },
};
