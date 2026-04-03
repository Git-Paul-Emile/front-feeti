import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
}

interface AppContextType {
  userTickets: Ticket[];
  addTickets: (tickets: Ticket[]) => void;
  clearTickets: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);

  const addTickets = useCallback((tickets: Ticket[]) => {
    setUserTickets((prev) => [...prev, ...tickets]);
  }, []);

  const clearTickets = useCallback(() => {
    setUserTickets([]);
  }, []);

  return (
    <AppContext.Provider value={{ userTickets, addTickets, clearTickets }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans un AppProvider');
  return ctx;
}
