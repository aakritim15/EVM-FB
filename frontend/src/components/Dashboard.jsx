import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmployeeModal from './EmployeeModal';
import DesignationChart from './DesignationChart';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Plus, Edit, Trash2, LogOut, Loader2, AlertCircle, X } from 'lucide-react';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Fetch employees
  const {
    data: employeesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['employees', searchTerm],
    queryFn: () => employeeAPI.getEmployees({ search: searchTerm }),
  });

  const employees = employeesData?.data?.data || [];

  // Create employee mutation
  const createMutation = useMutation({
    mutationFn: (data) => employeeAPI.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setIsModalOpen(false);
      setSelectedEmployee(null);
      setErrorMessage('');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create employee';
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        setErrorMessage(errors.map(e => e.msg || e.message).join(', '));
      } else {
        setErrorMessage(message);
      }
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeAPI.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setIsModalOpen(false);
      setSelectedEmployee(null);
      setErrorMessage('');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update employee';
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        setErrorMessage(errors.map(e => e.msg || e.message).join(', '));
      } else {
        setErrorMessage(message);
      }
    },
  });

  // Delete employee mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => employeeAPI.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete employee';
      alert(message);
    },
  });

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  // Sort employees
  const sortedEmployees = [...employees].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const loading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Employee Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={logout}
                variant="destructive"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chart Section */}
        <div className="mb-8">
          <DesignationChart employees={employees} />
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 items-center">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="designation">Sort by Designation</option>
                  <option value="salary">Sort by Salary</option>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading employees...</p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <p className="text-destructive">
                  Error: {error?.response?.data?.message || 'Failed to load employees'}
                </p>
              </div>
            ) : sortedEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No employees found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEmployees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>${employee.salary?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(employee._id)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {employees.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Total Employees: {employees.length}
          </div>
        )}
      </main>

      {/* Error Message Toast */}
      {errorMessage && !isModalOpen && (
        <div className="fixed top-4 right-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex justify-between items-start gap-4">
            <p className="flex-1">{errorMessage}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setErrorMessage('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
          setErrorMessage('');
        }}
        employee={selectedEmployee}
        onSave={handleSave}
        loading={loading}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default Dashboard;
