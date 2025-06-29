// Sample data moved from dashboard component
export const transactionData = [
  {
    id: 'TRX-2024-8471',
    date: '2024-01-15',
    customer: 'Global Tech Solutions',
    type: 'Sales Order',
    amount: '$45,280',
    department: 'Sales',
    status: 'Processing',
    assignedTo: 'Mike Chen',
    priority: 'High'
  },
  {
    id: 'TRX-2024-8472',
    date: '2024-01-15',
    customer: 'Premier Manufacturing',
    type: 'Purchase Order',
    amount: '$32,150',
    department: 'Procurement',
    status: 'Approved',
    assignedTo: 'Lisa Wong',
    priority: 'Normal'
  },
  {
    id: 'TRX-2024-8473',
    date: '2024-01-15',
    customer: 'Apex Logistics',
    type: 'Invoice',
    amount: '$18,750',
    department: 'Finance',
    status: 'Pending',
    assignedTo: 'David Park',
    priority: 'Critical'
  },
  {
    id: 'TRX-2024-8474',
    date: '2024-01-14',
    customer: 'Retail Partners Inc',
    type: 'Sales Order',
    amount: '$67,890',
    department: 'Sales',
    status: 'Shipped',
    assignedTo: 'Emma Davis',
    priority: 'Normal'
  },
  {
    id: 'TRX-2024-8475',
    date: '2024-01-14',
    customer: 'Industrial Supply Co',
    type: 'Return',
    amount: '$5,420',
    department: 'Customer Service',
    status: 'Under Review',
    assignedTo: 'Tom Wilson',
    priority: 'High'
  }
];

export const departmentData = [
  { department: 'Sales', efficiency: '94.2%', tasks: 247, completion: '89%' },
  { department: 'Operations', efficiency: '91.8%', tasks: 186, completion: '92%' },
  { department: 'Finance', efficiency: '88.5%', tasks: 142, completion: '87%' },
  { department: 'HR', efficiency: '92.7%', tasks: 98, completion: '95%' },
  { department: 'IT', efficiency: '90.3%', tasks: 173, completion: '88%' },
  { department: 'Procurement', efficiency: '87.9%', tasks: 124, completion: '91%' },
];

export const resourceData = [
  { resource: 'Workforce', allocated: 450, used: 412, available: 38, status: 'Optimal' },
  { resource: 'Equipment', allocated: 85, used: 78, available: 7, status: 'High Usage' },
  { resource: 'Vehicles', allocated: 32, used: 28, available: 4, status: 'Available' },
];

export const inventoryData = [
  { category: 'Raw Materials', stock: '8,450 units', min: '5,000 units', reorder: '6,000 units', status: 'Sufficient' },
  { category: 'Components', stock: '3,200 units', min: '3,000 units', reorder: '3,500 units', status: 'Low Stock' },
  { category: 'Finished Goods', stock: '12,750 units', min: '8,000 units', reorder: '10,000 units', status: 'Sufficient' },
  { category: 'Packaging', stock: '15,420 units', min: '10,000 units', reorder: '12,000 units', status: 'Sufficient' },
];

export const transactionColumns = [
  { key: 'id', label: 'Transaction ID', render: (value: string) => <strong>{value}</strong> },
  { key: 'date', label: 'Date' },
  { key: 'customer', label: 'Customer' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'department', label: 'Department' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value: string) => {
      const statusClass = value === 'Processing' || value === 'Approved' || value === 'Shipped' 
        ? 'active' 
        : value === 'Pending' 
        ? 'pending' 
        : 'inactive';
      return <span className={`status-badge ${statusClass}`}>{value}</span>;
    }
  },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'priority', label: 'Priority' },
  { 
    key: 'actions', 
    label: 'Actions',
    render: () => <button className="btn" style={{ padding: '4px 8px', fontSize: '11px' }}>View</button>
  }
];