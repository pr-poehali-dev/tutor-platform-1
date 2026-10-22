import React, { Suspense, lazy, useMemo } from 'react';
import { LucideProps } from 'lucide-react';
import { iconGroupIndex, iconGroupLoaders } from './icon-groups';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

/** Пустой компонент-заглушка — на случай, если чанк иконки не загрузился
 *  (сбой сети / устаревший кэш Vite). Возвращаем его вместо падения страницы. */
const EmptyIcon: React.ComponentType<LucideProps> = () => null;

/** Оборачивает загрузчик чанка иконки: при ошибке импорта (Failed to fetch
 *  dynamically imported module) отдаём пустую иконку, а не роняем всё дерево. */
function safeLoader(loader: IconLoader): IconLoader {
  return () => loader().catch(() => ({ default: EmptyIcon }));
}

/** Error boundary вокруг ленивой иконки — ловит ошибки рендера/загрузки чанка,
 *  чтобы одна не подгрузившаяся иконка не обрушивала всю страницу. */
class IconErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
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

function groupLoader(key: string): IconLoader | null {
  const gi = iconGroupIndex[key];
  if (gi === undefined) return null;
  return () =>
    iconGroupLoaders[gi]().then((m) => ({
      default: (m.default[key] as React.ComponentType<LucideProps>) || EmptyIcon,
    }));
}

// Кэш ленивых компонентов, чтобы не пересоздавать их на каждый рендер.
const cache = new Map<string, React.LazyExoticComponent<React.ComponentType<LucideProps>>>();

/** Старые имена lucide → новые (библиотека переименовала их, а в коде остались прежние). */
const LEGACY: Record<string, string> = {
  'code-2': 'code-xml', 'grid3x3': 'grid-3x3', 'loader-2': 'loader-circle', 'check-circle-2': 'circle-check', 'check-circle': 'circle-check-big',
  'help-circle': 'circle-help', 'unlock': 'lock-open', 'wand-2': 'wand-sparkles', 'home': 'house',
  'bar-chart-3': 'chart-column', 'alert-circle': 'circle-alert', 'user-circle': 'circle-user',
  'more-horizontal': 'ellipsis', 'link-off': 'link-2-off', 'alert-triangle': 'triangle-alert', 'play-square': 'square-play',
  'edit-3': 'pen-line', 'x-circle': 'circle-x', 'file-bar-chart': 'file-chart-column', 'line-chart': 'chart-line',
  'sliders': 'sliders-vertical', 'mic-2': 'mic-vocal', 'play-circle': 'circle-play',
};

function getLazyIcon(name: string): React.LazyExoticComponent<React.ComponentType<LucideProps>> | null {
  let key = toKebab(name);
  // Имена с цифрой («Building2», «Clock3») в lucide пишутся через дефис: building-2, clock-3.
  if (iconGroupIndex[key] === undefined) key = key.replace(/([a-z])(\d)/g, '$1-$2');
  // Переименования проверяем уже по имени с дефисом: «Wand2» → wand-2 → wand-sparkles.
  if (LEGACY[key] && iconGroupIndex[key] === undefined) key = LEGACY[key];
  const loader = groupLoader(key);
  if (!loader) return null;
  if (!cache.has(key)) cache.set(key, lazy(safeLoader(loader)));
  return cache.get(key)!;
}

/** Универсальная иконка. Иконки грузятся по требованию небольшими группами (по 26) —
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
    <IconErrorBoundary fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <AnyIcon {...props} />
      </Suspense>
    </IconErrorBoundary>
  );
};

export default Icon;