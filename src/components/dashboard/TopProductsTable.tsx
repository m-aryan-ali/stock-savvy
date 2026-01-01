import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/dataProcessor';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function TopProductsTable() {
  const { products } = useData();
  const topProducts = products.slice(0, 10);

  return (
    <div className="rounded-xl bg-card p-6 card-glow opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Top Performing Products</h3>
        <span className="text-sm text-muted-foreground">By estimated profit</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Demand</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Profit</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr 
                key={product.productName} 
                className="data-table-row opacity-0 animate-fade-in"
                style={{ animationDelay: `${600 + index * 50}ms` }}
              >
                <td className="px-4 py-3">
                  <div className="max-w-[200px]">
                    <p className="truncate text-sm font-medium text-foreground">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">{product.subCategory}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {product.weeklyDemand > 5 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-sm font-medium text-foreground">{product.weeklyDemand}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-success">
                  {formatCurrency(product.estimatedProfitPKR)}
                </td>
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
    </div>
  );
}
