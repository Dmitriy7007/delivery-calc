import { Button } from '@/shared/ui';
import { PenTool, Undo, Redo, Check, X, RefreshCw, Save, Triangle, Square, Scaling } from 'lucide-react';
import type { DrawingState } from '../model/useDrawing';

interface DrawingMetrics {
  area: number;
  perimeter: number;
  vertices: number;
}

function formatArea(m2: number): string {
  if (m2 >= 1_000_000) return (m2 / 1_000_000).toFixed(2) + ' км²';
  if (m2 >= 10_000) return (m2 / 10_000).toFixed(2) + ' га';
  return Math.round(m2).toLocaleString() + ' м²';
}

function formatLength(m: number): string {
  if (m >= 1000) return (m / 1000).toFixed(2) + ' км';
  return Math.round(m) + ' м';
}

interface DrawingToolbarProps {
  state: DrawingState;
  pointCount: number;
  metrics?: DrawingMetrics;
  canUndo?: boolean;
  canRedo?: boolean;
  isEditing?: boolean;
  editingZoneName?: string;
  isSaving?: boolean;
  onStart: () => void;
  onUndo: () => void;
  onRedo?: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onReset: () => void;
  onSavePolygon?: () => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  state,
  pointCount,
  metrics,
  canUndo = false,
  canRedo = false,
  isEditing = false,
  editingZoneName,
  isSaving = false,
  onStart,
  onUndo,
  onRedo,
  onFinish,
  onCancel,
  onReset,
  onSavePolygon,
}) => {
  if (state === 'idle') {
    return (
      <div className="drawing-toolbar">
        <Button variant="primary" onClick={onStart} icon={<PenTool size={16} />}>
          Нарисовать зону
        </Button>

        <style>{`
          .drawing-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="drawing-toolbar">
      {state === 'drawing' && (
        <>
          <div className="drawing-toolbar__info">
            <span className="drawing-toolbar__dot" />
            Рисование
          </div>

          {/* Undo/Redo */}
          <div className="drawing-toolbar__group">
            <button
              className="drawing-toolbar__icon-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title="Отменить (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              className="drawing-toolbar__icon-btn"
              onClick={onRedo}
              disabled={!canRedo}
              title="Вернуть (Ctrl+Shift+Z)"
            >
              ↪
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onFinish}
            disabled={pointCount < 3}
          >
            <Check size={16} /> Завершить (Enter)
          </Button>
          <Button variant="danger" size="sm" onClick={onCancel} icon={<X size={16} />}>
            Отмена (Esc)
          </Button>
        </>
      )}

      {state === 'preview' && (
        <>
          <div className="drawing-toolbar__info">
            <span className={`drawing-toolbar__dot ${isEditing ? 'drawing-toolbar__dot--blue' : 'drawing-toolbar__dot--green'}`} />
            {isEditing
              ? <>Редактирование: <strong>{editingZoneName}</strong></>
              : 'Полигон готов'
            }
          </div>

          {/* Undo/Redo */}
          <div className="drawing-toolbar__group">
            <button
              className="drawing-toolbar__icon-btn"
              onClick={onUndo}
              disabled={!canUndo}
              title="Отменить (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              className="drawing-toolbar__icon-btn"
              onClick={onRedo}
              disabled={!canRedo}
              title="Вернуть (Ctrl+Shift+Z)"
            >
              ↪
            </button>
          </div>

          {isEditing && onSavePolygon && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSavePolygon}
              loading={isSaving}
            >
              <Save size={16} /> Сохранить полигон
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onReset} icon={<RefreshCw size={16} />}>
            Перерисовать
          </Button>
          <Button variant="danger" size="sm" onClick={onCancel} icon={<X size={16} />}>
            Отмена (Esc)
          </Button>
        </>
      )}

      {/* Метрики */}
      {metrics && metrics.vertices > 0 && (
        <div className="drawing-toolbar__metrics">
          <span className="drawing-toolbar__metric">
            <Triangle size={14} className="metric-icon" /> {metrics.vertices} {metrics.vertices === 1 ? 'точка' : metrics.vertices < 5 ? 'точки' : 'точек'}
          </span>
          {metrics.area > 0 && (
            <span className="drawing-toolbar__metric">
              <Scaling size={14} className="metric-icon" /> {formatArea(metrics.area)}
            </span>
          )}
          {metrics.perimeter > 0 && (
            <span className="drawing-toolbar__metric">
              <Square size={14} className="metric-icon" /> {formatLength(metrics.perimeter)}
            </span>
          )}
        </div>
      )}

      <style>{`
        .drawing-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .drawing-toolbar__info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: var(--text-soft);
          padding: 6px 12px;
          background: var(--surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
        }

        .drawing-toolbar__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--red);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .drawing-toolbar__dot--green {
          background: var(--green);
          animation: none;
        }

        .drawing-toolbar__dot--blue {
          background: var(--cyan);
          animation: pulse 2s ease-in-out infinite;
        }

        .drawing-toolbar__group {
          display: flex;
          gap: 2px;
          padding: 2px;
          background: var(--surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
        }

        .drawing-toolbar__icon-btn {
          width: 30px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-soft);
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .drawing-toolbar__icon-btn:hover:not(:disabled) {
          background: var(--surface-2);
          color: var(--text);
        }

        .drawing-toolbar__icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .drawing-toolbar__metrics {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
          padding: 6px 12px;
          background: var(--surface);
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
        }

        .drawing-toolbar__metric {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
          white-space: nowrap;
        }
        
        .metric-icon {
          vertical-align: text-bottom;
          margin-right: 2px;
          color: var(--text-soft);
        }
      `}</style>
    </div>
  );
};
