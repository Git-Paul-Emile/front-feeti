import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import CountryAPI, { type Country } from '../services/api/CountryAPI';

const ALL_COUNTRIES_KEY = 'ALL';

interface CountryContextValue {
  countries: Country[];
  selectedCountry: Country | null;   // null = "Tous les pays"
  setSelectedCountry: (country: Country | null) => void;
  loading: boolean;
}

const CountryContext = createContext<CountryContextValue | null>(null);
const STORAGE_KEY = 'feeti_selected_country';

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountryState] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CountryAPI.getAll()
      .then(data => {
        setCountries(data);
        const saved = localStorage.getItem(STORAGE_KEY);
        // 'ALL' or missing → tous les pays (null)
        if (!saved || saved === ALL_COUNTRIES_KEY) {
          setSelectedCountryState(null);
          return;
        }
        const found = data.find(c => c.code === saved);
        setSelectedCountryState(found ?? null);
      })
      .catch(() => {
        const fallback: Country[] = [
          { id: 'cg', code: 'CG', name: 'République du Congo', flag: '🇨🇬', isActive: true },
          { id: 'cd', code: 'CD', name: 'RDC',                  flag: '🇨🇩', isActive: true },
          { id: 'ga', code: 'GA', name: 'Gabon',                flag: '🇬🇦', isActive: true },
          { id: 'ci', code: 'CI', name: "Côte d'Ivoire",        flag: '🇨🇮', isActive: true },
        ];
        setCountries(fallback);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved || saved === ALL_COUNTRIES_KEY) { setSelectedCountryState(null); return; }
        setSelectedCountryState(fallback.find(c => c.code === saved) ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSelectedCountry = useCallback((country: Country | null) => {
    setSelectedCountryState(country);
    localStorage.setItem(STORAGE_KEY, country ? country.code : ALL_COUNTRIES_KEY);
  }, []);

  return (
    <CountryContext.Provider value={{ countries, selectedCountry, setSelectedCountry, loading }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
