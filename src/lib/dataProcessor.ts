import Papa from 'papaparse';

export interface RawSalesRecord {
  'Row ID': string;
  'Order ID': string;
  'Order Date': string;
  'Ship Date': string;
  'Ship Mode': string;
  'Customer ID': string;
  'Customer Name': string;
  'Segment': string;
  'Country': string;
  'City': string;
  'State': string;
  'Postal Code': string;
  'Region': string;
  'Product ID': string;
  'Category': string;
  'Sub-Category': string;
  'Product Name': string;
  'Sales': string;
  'Quantity': string;
  'Discount': string;
  'Profit': string;
}

export interface ProcessedProduct {
  productName: string;
  category: string;
  subCategory: string;
  weeklyDemand: number;
  recommendedStock: number;
  profitPerUnitPKR: number;
  estimatedProfitPKR: number;
  stockStatus: 'Buy More' | 'Normal Stock' | 'Low Demand';
  totalSales: number;
  totalQuantity: number;
  avgDiscount: number;
}

export interface CategoryPerformance {
  category: string;
  totalSales: number;
  totalProfit: number;
  totalQuantity: number;
  productCount: number;
}

export interface WeeklyTrend {
  week: string;
  sales: number;
  profit: number;
  quantity: number;
}

export interface DashboardMetrics {
  totalSales: number;
  totalProfit: number;
  totalProducts: number;
  avgProfitMargin: number;
  topCategory: string;
  totalOrders: number;
}

const USD_TO_PKR = 278;
const SAFETY_BUFFER = 1.2;

export async function loadAndProcessData(): Promise<{
  products: ProcessedProduct[];
  categories: CategoryPerformance[];
  weeklyTrends: WeeklyTrend[];
  metrics: DashboardMetrics;
}> {
  const response = await fetch('/data/superstore.csv');
  const csvText = await response.text();
  
  const parsed = Papa.parse<RawSalesRecord>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  
  const records = parsed.data.filter(r => 
    r.Quantity && parseFloat(r.Quantity) > 0 && 
    r.Profit && !isNaN(parseFloat(r.Profit))
  );

  // Calculate profit per unit for each record
  const recordsWithPPU = records.map(r => ({
    ...r,
    profitPerUnit: parseFloat(r.Profit) / parseFloat(r.Quantity),
    sales: parseFloat(r.Sales),
    quantity: parseFloat(r.Quantity),
    profit: parseFloat(r.Profit),
    discount: parseFloat(r.Discount),
    orderDate: new Date(r['Order Date']),
  }));

  // Remove outliers (top and bottom 5%)
  const sortedByPPU = [...recordsWithPPU].sort((a, b) => a.profitPerUnit - b.profitPerUnit);
  const cutoff = Math.floor(sortedByPPU.length * 0.05);
  const filteredRecords = sortedByPPU.slice(cutoff, sortedByPPU.length - cutoff);

  // Group by product
  const productMap = new Map<string, typeof filteredRecords>();
  filteredRecords.forEach(r => {
    const key = r['Product Name'];
    if (!productMap.has(key)) productMap.set(key, []);
    productMap.get(key)!.push(r);
  });

  // Calculate weeks span
  const allDates = filteredRecords.map(r => r.orderDate.getTime());
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const weeksSpan = Math.max(1, Math.ceil((maxDate - minDate) / (7 * 24 * 60 * 60 * 1000)));

  // Process products
  const products: ProcessedProduct[] = [];
  productMap.forEach((records, productName) => {
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);
    const totalSales = records.reduce((sum, r) => sum + r.sales, 0);
    const avgDiscount = records.reduce((sum, r) => sum + r.discount, 0) / records.length;
    
    const avgProfitPerUnit = totalProfit / totalQuantity;
    const avgProfitPerUnitPKR = avgProfitPerUnit * USD_TO_PKR;
    
    // Skip loss-making products
    if (avgProfitPerUnitPKR <= 0) return;
    
    const weeklyDemand = totalQuantity / weeksSpan;
    const recommendedStock = Math.round(weeklyDemand * SAFETY_BUFFER);
    
    let stockStatus: ProcessedProduct['stockStatus'];
    if (recommendedStock > 20) stockStatus = 'Buy More';
    else if (recommendedStock < 5) stockStatus = 'Low Demand';
    else stockStatus = 'Normal Stock';
    
    const estimatedProfitPKR = avgProfitPerUnitPKR * recommendedStock;
    
    products.push({
      productName,
      category: records[0]['Category'],
      subCategory: records[0]['Sub-Category'],
      weeklyDemand: Math.round(weeklyDemand * 10) / 10,
      recommendedStock,
      profitPerUnitPKR: Math.round(avgProfitPerUnitPKR),
      estimatedProfitPKR: Math.round(estimatedProfitPKR),
      stockStatus,
      totalSales: Math.round(totalSales),
      totalQuantity: Math.round(totalQuantity),
      avgDiscount: Math.round(avgDiscount * 100),
    });
  });

  // Sort by estimated profit
  products.sort((a, b) => b.estimatedProfitPKR - a.estimatedProfitPKR);

  // Category performance
  const categoryMap = new Map<string, CategoryPerformance>();
  products.forEach(p => {
    if (!categoryMap.has(p.category)) {
      categoryMap.set(p.category, {
        category: p.category,
        totalSales: 0,
        totalProfit: 0,
        totalQuantity: 0,
        productCount: 0,
      });
    }
    const cat = categoryMap.get(p.category)!;
    cat.totalSales += p.totalSales;
    cat.totalProfit += p.estimatedProfitPKR;
    cat.totalQuantity += p.totalQuantity;
    cat.productCount += 1;
  });
  const categories = Array.from(categoryMap.values());

  // Weekly trends (aggregate by week)
  const weekMap = new Map<string, WeeklyTrend>();
  filteredRecords.forEach(r => {
    const weekStart = new Date(r.orderDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { week: weekKey, sales: 0, profit: 0, quantity: 0 });
    }
    const w = weekMap.get(weekKey)!;
    w.sales += r.sales;
    w.profit += r.profit;
    w.quantity += r.quantity;
  });
  const weeklyTrends = Array.from(weekMap.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-52); // Last year

  // Dashboard metrics
  const totalSales = products.reduce((sum, p) => sum + p.totalSales, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.estimatedProfitPKR, 0);
  const uniqueOrders = new Set(filteredRecords.map(r => r['Order ID'])).size;
  
  const topCategory = categories.reduce((a, b) => 
    a.totalSales > b.totalSales ? a : b
  ).category;

  const metrics: DashboardMetrics = {
    totalSales,
    totalProfit,
    totalProducts: products.length,
    avgProfitMargin: Math.round((totalProfit / (totalSales * USD_TO_PKR)) * 100),
    topCategory,
    totalOrders: uniqueOrders,
  };

  return { products, categories, weeklyTrends, metrics };
}

export function formatCurrency(amount: number, currency: 'USD' | 'PKR' = 'PKR'): string {
  if (currency === 'PKR') {
    return `PKR ${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
