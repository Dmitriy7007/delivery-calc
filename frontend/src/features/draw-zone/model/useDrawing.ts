import { useState, useCallback, useEffect, useRef } from 'react';
import turfArea from '@turf/area';
import turfLength from '@turf/length';
import { polygon as turfPolygon, lineString as turfLineString } from '@turf/helpers';

export type DrawingState = 'idle' | 'drawing' | 'preview';

interface DrawingMetrics {
  area: number;      // м²
  perimeter: number;  // м
  vertices: number;
}

export function useDrawing() {
  const [state, setState] = useState<DrawingState>('idle');
  const [coords, setCoords] = useState<[number, number][]>([]);

  // Undo/Redo стек
  const [history, setHistory] = useState<[number, number][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Метрики
  const [metrics, setMetrics] = useState<DrawingMetrics>({ area: 0, perimeter: 0, vertices: 0 });

  // Ref для актуальных значений в keyboard listener
  const stateRef = useRef(state);
  const coordsRef = useRef(coords);
  stateRef.current = state;
  coordsRef.current = coords;

  // === History helpers ===
  const pushHistory = useCallback((newCoords: [number, number][]) => {
    setHistory(prev => {
      // Обрезаем redo-ветку
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newCoords];
    });
    setHistoryIndex(prev => prev + 1);
    setCoords(newCoords);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCoords(history[newIndex]);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCoords(history[newIndex]);
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // === Пересчёт метрик ===
  useEffect(() => {
    if (coords.length < 2) {
      setMetrics({ area: 0, perimeter: 0, vertices: coords.length });
      return;
    }

    try {
      let area = 0;
      let perimeter = 0;

      if (coords.length >= 3) {
        const ring = [...coords, coords[0]];
        const poly = turfPolygon([ring]);
        area = turfArea(poly);

        const line = turfLineString(ring);
        perimeter = turfLength(line, { units: 'meters' });
      } else {
        const line = turfLineString(coords);
        perimeter = turfLength(line, { units: 'meters' });
      }

      setMetrics({ area, perimeter, vertices: coords.length });
    } catch {
      setMetrics({ area: 0, perimeter: 0, vertices: coords.length });
    }
  }, [coords]);

  // === Действия ===
  const startDrawing = useCallback(() => {
    setState('drawing');
    setCoords([]);
    setHistory([[] as [number, number][]]);
    setHistoryIndex(0);
  }, []);

  /** Загрузить существующие координаты для редактирования полигона */
  const loadCoords = useCallback((existingCoords: [number, number][]) => {
    setState('preview');
    setCoords(existingCoords);
    setHistory([existingCoords]);
    setHistoryIndex(0);
  }, []);

  const addPoint = useCallback(
    (coord: [number, number]) => {
      if (stateRef.current !== 'drawing') return;

      const current = coordsRef.current;

      // Замыкание при клике рядом с первой точкой
      if (current.length >= 3) {
        const [x0, y0] = current[0];
        const dist = Math.sqrt((coord[0] - x0) ** 2 + (coord[1] - y0) ** 2);
        if (dist < 0.002) {
          setState('preview');
          return;
        }
      }

      const newCoords = [...current, coord];
      pushHistory(newCoords);
    },
    [pushHistory]
  );

  /** Вставить точку между index и index+1 (для midpoint) */
  const insertPoint = useCallback(
    (index: number, coord: [number, number]) => {
      const current = coordsRef.current;
      const newCoords = [...current];
      newCoords.splice(index + 1, 0, coord);
      pushHistory(newCoords);
    },
    [pushHistory]
  );

  /** Обновить координаты точки по индексу (перетаскивание) */
  const updatePoint = useCallback(
    (index: number, coord: [number, number]) => {
      const current = coordsRef.current;
      const newCoords = [...current];
      newCoords[index] = coord;
      pushHistory(newCoords);
    },
    [pushHistory]
  );

  /** Удалить точку по индексу */
  const removePoint = useCallback(
    (index: number) => {
      const current = coordsRef.current;
      if (current.length <= 3 && stateRef.current === 'preview') return;
      const newCoords = current.filter((_, i) => i !== index);
      pushHistory(newCoords);
    },
    [pushHistory]
  );

  const undoPoint = useCallback(() => {
    undo();
  }, [undo]);

  const finishDrawing = useCallback(() => {
    if (coordsRef.current.length >= 3) {
      setState('preview');
    }
  }, []);

  const cancelDrawing = useCallback(() => {
    setState('idle');
    setCoords([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const resetDrawing = useCallback(() => {
    setState('drawing');
    setCoords([]);
    setHistory([[] as [number, number][]]);
    setHistoryIndex(0);
  }, []);

  const getPolygonCoords = useCallback((): [number, number][][] => {
    if (coords.length < 3) return [];
    return [[...coords, coords[0]]];
  }, [coords]);

  // === Горячие клавиши ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = stateRef.current;
      if (currentState === 'idle') return;

      // Не перехватывать если фокус в инпуте/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Escape — отмена
      if (e.key === 'Escape') {
        e.preventDefault();
        setState('idle');
        setCoords([]);
        setHistory([]);
        setHistoryIndex(-1);
        return;
      }

      // Enter — завершить
      if (e.key === 'Enter' && currentState === 'drawing') {
        e.preventDefault();
        if (coordsRef.current.length >= 3) {
          setState('preview');
        }
        return;
      }

      // Ctrl+Z — undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z — redo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+Y — redo (alternative)
      if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete — удалить последнюю точку
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const current = coordsRef.current;
        if (current.length > 0) {
          const newCoords = current.slice(0, -1);
          pushHistory(newCoords);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pushHistory]);

  return {
    state,
    coords,
    metrics,
    canUndo,
    canRedo,
    startDrawing,
    loadCoords,
    addPoint,
    insertPoint,
    updatePoint,
    removePoint,
    undoPoint,
    undo,
    redo,
    finishDrawing,
    cancelDrawing,
    resetDrawing,
    getPolygonCoords,
  };
}
