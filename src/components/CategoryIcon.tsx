import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Try to find the icon component dynamically from lucide-react
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string; size?: number }>>)[name] || Icons.Tag;

  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'ShoppingBag',
  'Car',
  'Home',
  'Zap',
  'HeartPulse',
  'GraduationCap',
  'ShoppingCart',
  'Film',
  'Plane',
  'Tv',
  'Sparkles',
  'TrendingUp',
  'Wallet',
  'Briefcase',
  'LineChart',
  'Gift',
  'PlusCircle',
  'Coffee',
  'Fuel',
  'ShieldAlert',
  'Smartphone',
  'DollarSign',
  'CreditCard',
  'Tag',
];
