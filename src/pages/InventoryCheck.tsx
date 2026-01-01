import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/dataProcessor';
import { cn } from '@/lib/utils';
import { Search, Package, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  productName: string;
  currentStock: number;
  recommendedStock: number;
  difference: number;
  status: 'ok' | 'low' | 'excess';
}

export default function InventoryCheck() {
  const { products, loading, error } = useData();
  const [search, setSearch] = useState('');
  const [inventoryInputs, setInventoryInputs] = useState<Record<string, string>>({});
  const [checkedProducts, setCheckedProducts] = useState<InventoryItem[]>([]);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const searchLower = search.toLowerCase();
    return products
      .filter(p => 
        p.productName.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.subCategory.toLowerCase().includes(searchLower)
      )
      .slice(0, 10);
  }, [products, search]);

  const handleStockInput = (productName: string, value: string) => {
    setInventoryInputs(prev => ({
      ...prev,
      [productName]: value
    }));
  };

  const checkInventory = (productName: string) => {
    const product = products.find(p => p.productName === productName);
    if (!product) return;

    const currentStock = parseInt(inventoryInputs[productName] || '0', 10);
    const recommendedStock = product.recommendedStock;
    const difference = recommendedStock - currentStock;

    let status: InventoryItem['status'] = 'ok';
    if (difference > 5) status = 'low';
    else if (difference < -10) status = 'excess';

    const existingIndex = checkedProducts.findIndex(p => p.productName === productName);
    const newItem: InventoryItem = {
      productName,
      currentStock,
      recommendedStock,
      difference,
      status
    };

    if (existingIndex >= 0) {
      setCheckedProducts(prev => {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      });
    } else {
      setCheckedProducts(prev => [newItem, ...prev]);
    }

    setSearch('');
    setInventoryInputs(prev => ({ ...prev, [productName]: '' }));
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Manual Inventory Check</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Search products and enter your current stock to compare with recommendations
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8 rounded-xl bg-card border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Search Product</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product name, category, or sub-category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border text-lg"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map(product => (
              <div 
                key={product.productName}
                className="flex items-center justify-between rounded-lg bg-muted/30 border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category} • {product.subCategory} • Recommended: <span className="text-primary font-semibold">{product.recommendedStock} units</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="Current stock"
                    value={inventoryInputs[product.productName] || ''}
                    onChange={(e) => handleStockInput(product.productName, e.target.value)}
                    className="w-32 bg-background border-border"
                    min="0"
                  />
                  <Button 
                    onClick={() => checkInventory(product.productName)}
                    disabled={!inventoryInputs[product.productName]}
                  >
                    Check
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {search && searchResults.length === 0 && (
          <p className="mt-4 text-center text-muted-foreground">No products found matching "{search}"</p>
        )}
      </div>

      {/* Checked Products */}
      {checkedProducts.length > 0 && (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Inventory Comparison Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difference</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {checkedProducts.map((item, index) => (
                  <tr 
                    key={item.productName} 
                    className="data-table-row opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground max-w-[300px] truncate">{item.productName}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">{item.currentStock}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-primary">{item.recommendedStock}</td>
                    <td className={cn(
                      'px-4 py-3 text-right text-sm font-bold',
                      item.difference > 0 ? 'text-destructive' : item.difference < 0 ? 'text-success' : 'text-foreground'
                    )}>
                      {item.difference > 0 ? `+${item.difference} needed` : item.difference < 0 ? `${Math.abs(item.difference)} excess` : 'Perfect'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'low' && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-destructive/20 px-3 py-1 text-xs font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Order More
                        </div>
                      )}
                      {item.status === 'excess' && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          Overstocked
                        </div>
                      )}
                      {item.status === 'ok' && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
                          <CheckCircle className="h-3 w-3" />
                          Optimal
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {checkedProducts.length === 0 && (
        <div className="rounded-xl bg-muted/20 border border-dashed border-border p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No inventory checks yet</h3>
          <p className="mt-2 text-muted-foreground">
            Search for products above and enter your current stock levels to compare with ML recommendations
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
