'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function KPICard({ label, value, trend, variant = 'default' }: KPICardProps) {
  const variantClasses = {
    default: '',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  };

  return (
    <div className={`kpi-card ${variantClasses[variant]}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : ''}`}>
          {trend.direction === 'up' && <ArrowUp className="w-3 h-3" />}
          {trend.direction === 'down' && <ArrowDown className="w-3 h-3" />}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}