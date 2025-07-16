import React from 'react';
import {
  Dices,
  BoxIcon,
  PenLineIcon,
  LightbulbIcon,
  LineChartIcon,
  ShoppingBagIcon,
  PlaneTakeoffIcon,
  GraduationCapIcon,
  TerminalSquareIcon,
} from 'lucide-react';
import { cn } from '~/utils';

const categoryIconMap: Record<string, React.ElementType> = {
  misc: BoxIcon,
  roleplay: Dices,
  write: PenLineIcon,
  idea: LightbulbIcon,
  shop: ShoppingBagIcon,
  finance: LineChartIcon,
  code: TerminalSquareIcon,
  travel: PlaneTakeoffIcon,
  teach_or_explain: GraduationCapIcon,
};

const categoryColorMap: Record<string, string> = {
  code: 'text-opencure-orange-600',
  misc: 'text-opencure-blue-500',
  shop: 'text-opencure-cyan-600',
  idea: 'text-opencure-orange-500/90 dark:text-opencure-orange-400',
  write: 'text-opencure-cyan-500',
  travel: 'text-opencure-orange-500/90 dark:text-opencure-orange-400',
  finance: 'text-opencure-blue-600',
  roleplay: 'text-opencure-orange-600',
  teach_or_explain: 'text-opencure-blue-500',
};

export default function CategoryIcon({
  category,
  className = '',
}: {
  category: string;
  className?: string;
}) {
  const IconComponent = categoryIconMap[category];
  const colorClass = categoryColorMap[category] + ' ' + className;
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={cn(colorClass, className)} aria-hidden="true" />;
}
