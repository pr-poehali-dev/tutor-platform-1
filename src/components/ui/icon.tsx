import React, { Suspense, lazy, useMemo } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

/** PascalCase / camelCase → kebab-case (имена файлов иконок lucide).
 *  Пример: "CircleAlert" → "circle-alert", "ArrowUpDown" → "arrow-up-down". */
function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

type IconLoader = () => Promise<{ default: React.ComponentType<LucideProps> }>;
const imports = dynamicIconImports as unknown as Record<string, IconLoader>;

// Кэш ленивых компонентов, чтобы не пересоздавать их на каждый рендер.
const cache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

function getLazyIcon(name: string): React.LazyExoticComponent<React.ComponentType<LucideProps>> | null {
  const key = toKebab(name);
  const loader = imports[key];
  if (!loader) return null;
  if (!cache.has(key)) cache.set(key, lazy(loader));
  return cache.get(key)!;
}

/** Универсальная иконка. Каждая иконка грузится отдельным чанком по требованию —
 *  это убирает всю библиотеку lucide-react (~220 КБ) из главного бандла и
 *  заметно ускоряет первую загрузку сайта. */
const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const LazyIcon = useMemo(
    () => getLazyIcon(name) || getLazyIcon(fallback),
    [name, fallback]
  );

  const size = (props.size as number) ?? 24;
  // Placeholder тех же размеров — чтобы не было скачков верстки при подгрузке.
  const placeholder = (
    <span style={{ display: 'inline-block', width: size, height: size }} aria-hidden />
  );

  if (!LazyIcon) return placeholder;

  const AnyIcon = LazyIcon as unknown as React.ComponentType<LucideProps>;
  return (
    <Suspense fallback={placeholder}>
      <AnyIcon {...props} />
    </Suspense>
  );
};

export default Icon;