import { useRef, memo } from "react";
import styles from "./Note.module.css";
import { NoteType } from "../../types/note";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 500;
const MAX_HEIGHT = 400;

export interface NoteProps extends NoteType {
  onChange: (value: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onFocus: (id: string) => void;
  onDrop: (mouseX: number, mouseY: number) => void;
}

const Note = ({
  id,
  content,
  position,
  size,
  zIndex,
  onChange,
  onMove,
  onResize,
  onFocus,
  onDrop,
}: NoteProps) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  });

  const rafId = useRef<number | null>(null);

  const handlePointerMove = (e: PointerEvent) => {
    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;

      if (isDragging.current) {
        onMove(id, e.clientX - offset.current.x, e.clientY - offset.current.y);
      }

      if (isResizing.current) {
        let newWidth =
          resizeStart.current.width + (e.clientX - resizeStart.current.x);
        let newHeight =
          resizeStart.current.height + (e.clientY - resizeStart.current.y);

        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

        onResize(id, newWidth, newHeight);
      }
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isDragging.current) {
      onDrop(e.clientX, e.clientY);
    }

    isDragging.current = false;
    isResizing.current = false;

    const el = e.currentTarget as HTMLElement;
    el.releasePointerCapture(e.pointerId);
    el.onpointermove = null;
    el.onpointerup = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.resizeHandler))
      return;

    e.stopPropagation();
    onFocus(id);

    isDragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    el.onpointermove = handlePointerMove;
    el.onpointerup = handlePointerUp;
  };

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus(id);

    isResizing.current = true;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };

    const el = e.currentTarget.parentElement!;
    el.setPointerCapture(e.pointerId);
    el.onpointermove = handlePointerMove;
    el.onpointerup = handlePointerUp;
  };

  return (
    <div
      className={styles.note}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className={styles.resizeHandler}
        onPointerDown={handleResizePointerDown}
      />
    </div>
  );
};

export default memo(
  Note,
  (prev, next) =>
    prev.content === next.content &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y &&
    prev.size.width === next.size.width &&
    prev.size.height === next.size.height &&
    prev.zIndex === next.zIndex,
);
