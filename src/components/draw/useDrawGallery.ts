import { useCallback, useEffect, useState } from "react";

/**
 * Галерея работ ребёнка: сохраняем рисунки (PNG base64) в localStorage.
 * Ограничение размера: до 30 рисунков (старые удаляются).
 */

const STORAGE_KEY = "uchispro_draw_gallery_v1";
const MAX_ITEMS = 30;

export interface GalleryItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  emoji: string;
  dataUrl: string; // PNG base64
  createdAt: number;
}

function load(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GalleryItem[];
  } catch {
    return [];
  }
}

function save(items: GalleryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("uchispro_draw_gallery_change"));
  } catch {
    /* QuotaExceeded — пробуем уменьшить */
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
    } catch { /* noop */ }
  }
}

export function useDrawGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => load());

  useEffect(() => {
    const onChange = () => setItems(load());
    window.addEventListener("uchispro_draw_gallery_change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("uchispro_draw_gallery_change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const add = useCallback((item: Omit<GalleryItem, "id" | "createdAt">) => {
    const newItem: GalleryItem = {
      ...item,
      id: `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    const next = [newItem, ...load()].slice(0, MAX_ITEMS);
    save(next);
    setItems(next);
    return newItem;
  }, []);

  const remove = useCallback((id: string) => {
    const next = load().filter((i) => i.id !== id);
    save(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    save([]);
    setItems([]);
  }, []);

  return { items, add, remove, clear };
}
