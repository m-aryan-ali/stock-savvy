import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/dataProcessor';
import { cn } from '@/lib/utils';
import { Search, Filter, Download, Loader2, ArrowUpDown, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortField = 'profit' | 'demand' | 'stock' | 'name';
type SortOrder = 'asc' | 'desc';

export default function Recommendations() {
  const { products, categories, loading, error } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.subCategory.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.stockStatus === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'profit':
          comparison = a.estimatedProfitPKR - b.estimatedProfitPKR;
          break;
        case 'demand':
          comparison = a.weeklyDemand - b.weeklyDemand;
          break;
        case 'stock':
          comparison = a.recommendedStock - b.recommendedStock;
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, search, categoryFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Product Name', 'Category', 'Sub-Category', 'Weekly Demand', 'Recommended Stock', 'Est. Profit (PKR)', 'Status'];
    const rows = filteredProducts.map(p => [
      p.productName,
      p.category,
      p.subCategory,
      p.weeklyDemand,
      p.recommendedStock,
      p.estimatedProfitPKR,
      p.stockStatus
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase-recommendations.csv';
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const buyMoreCount = products.filter(p => p.stockStatus === 'Buy More').length;
  const normalCount = products.filter(p => p.stockStatus === 'Normal Stock').length;
  const lowDemandCount = products.filter(p => p.stockStatus === 'Low Demand').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Recommendations</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Weekly stock recommendations with 20% safety buffer. Sorted by highest estimated profit.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-success/10 border border-success/20 p-4">
          <p className="text-sm text-success font-medium">Buy More</p>
          <p className="text-2xl font-bold text-success">{buyMoreCount} products</p>
          <p className="text-xs text-muted-foreground">Recommended stock {'>'} 20 units</p>
        </div>
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
          <p className="text-sm text-primary font-medium">Normal Stock</p>
          <p className="text-2xl font-bold text-primary">{normalCount} products</p>
          <p className="text-xs text-muted-foreground">5-20 units recommended</p>
        </div>
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <p className="text-sm text-warning font-medium">Low Demand</p>
          <p className="text-2xl font-bold text-warning">{lowDemandCount} products</p>
          <p className="text-xs text-muted-foreground">{'<'} 5 units recommended</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Buy More">Buy More</SelectItem>
            <SelectItem value="Normal Stock">Normal Stock</SelectItem>
            <SelectItem value="Low Demand">Low Demand</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Product Name
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('demand')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Weekly Demand
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Rec. Stock
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profit/Unit</th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('profit')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Est. Profit
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice(0, 50).map((product, index) => (
                <tr 
                  key={product.productName} 
                  className="data-table-row opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="max-w-[250px]">
                      <p className="truncate text-sm font-medium text-foreground">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.subCategory}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">{product.weeklyDemand}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-primary">{product.recommendedStock}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatCurrency(product.profitPerUnitPKR)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-success">{formatCurrency(product.estimatedProfitPKR)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'status-badge',
                      product.stockStatus === 'Buy More' && 'status-buy-more',
                      product.stockStatus === 'Normal Stock' && 'status-normal',
                      product.stockStatus === 'Low Demand' && 'status-low-demand'
                    )}>
                      {product.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length > 50 && (
          <div className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
            Showing 50 of {filteredProducts.length} products. Use filters to narrow results.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
