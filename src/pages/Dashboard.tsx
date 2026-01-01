import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { TopProductsTable } from '@/components/dashboard/TopProductsTable';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatNumber } from '@/lib/dataProcessor';
import { DollarSign, Package, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { metrics, loading, error } = useData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading inventory data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="rounded-xl bg-destructive/10 p-8 text-center">
            <p className="text-lg text-destructive">Error: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Store Performance</h1>
        <p className="mt-2 text-muted-foreground">
          Weekly demand predictions and inventory insights powered by machine learning
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={`$${formatNumber(metrics?.totalSales || 0)}`}
          subtitle="All time revenue"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          delay={0}
        />
        <MetricCard
          title="Est. Weekly Profit"
          value={formatCurrency(metrics?.totalProfit || 0)}
          subtitle="Based on recommendations"
          icon={TrendingUp}
          trend={{ value: 8.3, isPositive: true }}
          delay={100}
        />
        <MetricCard
          title="Active Products"
          value={metrics?.totalProducts || 0}
          subtitle={`Top category: ${metrics?.topCategory || '-'}`}
          icon={Package}
          delay={200}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics?.totalOrders || 0)}
          subtitle={`${metrics?.avgProfitMargin || 0}% avg margin`}
          icon={ShoppingCart}
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesTrendChart />
        <CategoryChart />
      </div>

      {/* Top Products Table */}
      <TopProductsTable />
    </DashboardLayout>
  );
}
