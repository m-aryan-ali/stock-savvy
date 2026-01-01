import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  loadAndProcessData, 
  ProcessedProduct, 
  CategoryPerformance, 
  WeeklyTrend, 
  DashboardMetrics 
} from '@/lib/dataProcessor';

interface DataContextType {
  products: ProcessedProduct[];
  categories: CategoryPerformance[];
  weeklyTrends: WeeklyTrend[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProcessedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadAndProcessData();
        setProducts(data.products);
        setCategories(data.categories);
        setWeeklyTrends(data.weeklyTrends);
        setMetrics(data.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ products, categories, weeklyTrends, metrics, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
