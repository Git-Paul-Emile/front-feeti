import axios from 'axios';

export interface FeetiPlayEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  image: string;
  channelId: string;
  channelName: string;
  category: string;
  tags: string[];
  isLive: boolean;
  isReplay: boolean;
  isFeatured: boolean;
  isFree: boolean;
  price?: number;
  currency: string;
  viewerCount?: number;
  hasTicket?: boolean;
  streamUrl?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

interface FeetiPlayApiResponse<T> {
  data?: T;
}

const FEETIPLAY_API_BASE_URL =
  (import.meta as any).env?.VITE_FEETIPLAY_API_URL ?? 'http://localhost:8001/api';

const client = axios.create({
  baseURL: FEETIPLAY_API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

async function extractData<T>(path: string): Promise<T> {
  const response = await client.get<FeetiPlayApiResponse<T>>(path);
  return response.data.data as T;
}

const FeetiPlayEventsAPI = {
  getAll(): Promise<FeetiPlayEvent[]> {
    return extractData<FeetiPlayEvent[]>('/events');
  },

  getLive(): Promise<FeetiPlayEvent[]> {
    return extractData<FeetiPlayEvent[]>('/events?live=true');
  },

  getReplays(): Promise<FeetiPlayEvent[]> {
    return extractData<FeetiPlayEvent[]>('/events?replay=true');
  },

  getEventById(id: string): Promise<FeetiPlayEvent> {
    return extractData<FeetiPlayEvent>(`/events/${id}`);
  },
};

export default FeetiPlayEventsAPI;
