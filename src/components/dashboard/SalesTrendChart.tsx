import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { formatNumber } from '@/lib/dataProcessor';

export function SalesTrendChart() {
  const { weeklyTrends } = useData();

  const chartData = weeklyTrends.map(w => ({
    week: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: Math.round(w.sales),
    profit: Math.round(w.profit),
  }));

  return (
    <div className="rounded-xl bg-card p-6 card-glow opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <h3 className="mb-6 text-lg font-semibold text-card-foreground">Sales & Profit Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 25%)" />
            <XAxis 
              dataKey="week" 
              stroke="hsl(215, 20%, 65%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 65%)" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(217, 33%, 17%)', 
                border: '1px solid hsl(215, 28%, 25%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="hsl(174, 72%, 46%)" 
              fillOpacity={1} 
              fill="url(#salesGradient)" 
              strokeWidth={2}
              name="Sales"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(152, 69%, 45%)" 
              fillOpacity={1} 
              fill="url(#profitGradient)" 
              strokeWidth={2}
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Profit</span>
        </div>
      </div>
    </div>
  );
}
