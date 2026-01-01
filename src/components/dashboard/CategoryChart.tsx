import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { useData } from '@/contexts/DataContext';

const COLORS = ['hsl(174, 72%, 46%)', 'hsl(152, 69%, 45%)', 'hsl(38, 92%, 50%)'];

export function CategoryChart() {
  const { categories } = useData();

  const chartData = categories.map(c => ({
    name: c.category,
    value: Math.round(c.totalSales),
    products: c.productCount,
  }));

  return (
    <div className="rounded-xl bg-card p-6 card-glow opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <h3 className="mb-6 text-lg font-semibold text-card-foreground">Category Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(217, 33%, 17%)', 
                border: '1px solid hsl(215, 28%, 25%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
            />
            <Legend 
              formatter={(value) => <span style={{ color: 'hsl(215, 20%, 65%)' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
