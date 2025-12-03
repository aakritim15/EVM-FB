import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';

const DesignationChart = ({ employees }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate employees per designation
  const designationCount = employees.reduce((acc, emp) => {
    const designation = emp.designation || 'Unknown';
    acc[designation] = (acc[designation] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(designationCount).map(([name, count]) => ({
    name,
    employees: count,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employees per Designation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees per Designation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              stroke={isDark ? '#9ca3af' : '#6b7280'}
            />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                color: isDark ? '#f3f4f6' : '#111827',
              }}
            />
            <Legend 
              wrapperStyle={{
                color: isDark ? '#f3f4f6' : '#111827',
              }}
            />
            <Bar dataKey="employees" fill={isDark ? '#6366f1' : '#4f46e5'} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DesignationChart;
