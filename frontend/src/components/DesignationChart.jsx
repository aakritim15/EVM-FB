import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const DesignationChart = ({ employees }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredBar, setHoveredBar] = useState(null);

  // Calculate employees per designation
  const designationCount = employees.reduce((acc, emp) => {
    const designation = emp.designation || 'Unknown';
    acc[designation] = (acc[designation] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(designationCount)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      employees: count,
    }))
    .sort((a, b) => b.employees - a.employees);

  // Enhanced color palette with vibrant colors
  const colors = [
    'hsl(217, 91%, 60%)', // Blue
    'hsl(280, 70%, 70%)', // Purple
    'hsl(142, 71%, 45%)', // Green
    'hsl(38, 92%, 50%)',  // Yellow
    'hsl(0, 72%, 51%)',   // Red
    'hsl(199, 89%, 48%)', // Cyan
    'hsl(262, 83%, 58%)', // Indigo
    'hsl(24, 95%, 53%)',  // Orange
  ];

  const totalEmployees = employees.length;

  if (chartData.length === 0) {
    return (
      <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
              <Users className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <CardTitle>Employees per Designation</CardTitle>
          </div>
          <CardDescription>Visual breakdown of employees by their designation</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4 animate-bounce" />
            <p className="text-muted-foreground text-center">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip with glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const index = chartData.findIndex(item => item.fullName === data.fullName);
      return (
        <div className="backdrop-blur-xl bg-card/90 border border-border/50 rounded-lg shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <p className="font-semibold text-foreground">{data.fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-2xl text-primary">{payload[0].value}</span>
              <span className="ml-1">employee{payload[0].value !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {((payload[0].value / totalEmployees) * 100).toFixed(1)}% of total workforce
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for bars with animation
  const renderCustomLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <g>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <text
          x={x + width / 2}
          y={y - 8}
          fill={isDark ? '#e5e7eb' : '#374151'}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          filter="url(#glow)"
          className="drop-shadow-lg"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <Card className="relative overflow-hidden backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl transition-all duration-500 hover:shadow-3xl group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-gradient-shift" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse" />
      
      {/* Floating sparkles effect */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Sparkles className="h-8 w-8 text-primary animate-spin-slow" />
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20 animate-pulse-slow">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Employees per Designation
              </CardTitle>
            </div>
            <CardDescription className="mt-1">
              Visual breakdown of <span className="font-semibold text-primary">{totalEmployees}</span> employee{totalEmployees !== 1 ? 's' : ''} across <span className="font-semibold text-primary">{chartData.length}</span> designation{chartData.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="backdrop-blur-sm bg-muted/30 rounded-lg p-4 border border-border/30">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
              barSize={60}
            >
              <defs>
                {/* Gradient definitions with glow effect */}
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                    <stop offset="50%" stopColor={color} stopOpacity={0.85} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
                {/* Glow filter for bars */}
                <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? 'hsl(217.2, 32.6%, 17.5%)' : 'hsl(214.3, 31.8%, 91.4%)'}
                opacity={0.2}
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ 
                  fill: isDark ? 'hsl(215, 20.2%, 65.1%)' : 'hsl(215.4, 16.3%, 46.9%)', 
                  fontSize: 12,
                  fontWeight: 500
                }}
                stroke={isDark ? 'hsl(217.2, 32.6%, 17.5%)' : 'hsl(214.3, 31.8%, 91.4%)'}
              />
              <YAxis
                tick={{ 
                  fill: isDark ? 'hsl(215, 20.2%, 65.1%)' : 'hsl(215.4, 16.3%, 46.9%)', 
                  fontSize: 12,
                  fontWeight: 500
                }}
                stroke={isDark ? 'hsl(217.2, 32.6%, 17.5%)' : 'hsl(214.3, 31.8%, 91.4%)'}
                label={{ 
                  value: 'Number of Employees', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle',
                    fill: isDark ? 'hsl(215, 20.2%, 65.1%)' : 'hsl(215.4, 16.3%, 46.9%)',
                    fontWeight: 600
                  }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)', strokeWidth: 0 }}
                animationDuration={200}
              />
              <Bar
                dataKey="employees"
                radius={[12, 12, 0, 0]}
                animationDuration={1500}
                animationBegin={0}
                animationEasing="ease-out"
                onMouseEnter={(data, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#color${index % colors.length})`}
                    filter={hoveredBar === index ? 'url(#barGlow)' : 'none'}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: hoveredBar === index ? 'scaleY(1.05)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                    }}
                  />
                ))}
                <LabelList content={renderCustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats with glassmorphism */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/30">
          {chartData.slice(0, 4).map((item, index) => (
            <div 
              key={index} 
              className={cn(
                "text-center p-4 rounded-lg backdrop-blur-sm bg-muted/30 border border-border/30 transition-all duration-300",
                "hover:bg-muted/50 hover:border-primary/30 hover:scale-105 hover:shadow-lg",
                "animate-in fade-in-0 slide-in-from-bottom-4",
                "cursor-pointer group"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300"
              >
                {item.employees}
              </div>
              <div 
                className="text-xs text-muted-foreground mt-1 truncate group-hover:text-foreground transition-colors duration-300"
                title={item.fullName}
              >
                {item.name}
              </div>
              <div 
                className="w-8 h-1 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignationChart;
