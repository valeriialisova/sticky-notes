import { useRef, memo, useEffect } from "react";
import { type NoteType } from "../../types/note";
import styles from "./Note.module.css";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 500;
const MAX_HEIGHT = 400;

export type NoteProps = NoteType & {
  onChange: (value: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onFocus: (id: string) => void;
  onDrop: (mouseX: number, mouseY: number) => void;
};

const Note = ({
  id,
  content,
  position,
  size,
  zIndex = 1,
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

  // Prevent text selection while dragging/resizing
  const disableUserSelect = () => (document.body.style.userSelect = "none");
  const enableUserSelect = () => (document.body.style.userSelect = "");

  // Mouse move with requestAnimationFrame
  const handleMouseMove = (e: MouseEvent) => {
    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;

      if (isDragging.current) {
        const x = e.clientX - offset.current.x;
        const y = e.clientY - offset.current.y;
        onMove(id, x, y);
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

  const startListening = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const stopListening = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.resizeHandler))
      return;

    e.stopPropagation();
    disableUserSelect();
    onFocus(id);

    isDragging.current = true;
    isResizing.current = false;

    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    startListening();
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    disableUserSelect();

    isResizing.current = true;
    isDragging.current = false;

    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
    onFocus(id);

    startListening();
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging.current) onDrop(e.clientX, e.clientY);

    isDragging.current = false;
    isResizing.current = false;
    enableUserSelect();

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    stopListening();
  };

  useEffect(() => {
    // Cleanup in case component unmounts during drag/resize
    return () => {
      enableUserSelect();
      stopListening();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

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
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        placeholder="Write your note..."
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        className={styles.resizeHandler}
        onMouseDown={handleResizeMouseDown}
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
