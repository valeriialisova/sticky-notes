import { useRef, useState, useCallback } from "react";
import Controls from "../controls";
import Note from "../note";
import TrashZone from "../trashZone";
import { type NoteType } from "../../types/note";
import { isOverElement } from "../../utils/position";
import styles from "./NotesContainer.module.css";

const NotesContainer = () => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const trashRef = useRef<HTMLDivElement | null>(null);
  const draggingNoteId = useRef<string | null>(null);
  const highestZIndexRef = useRef(1);

  const createNote = (x: number, y: number): NoteType => {
    highestZIndexRef.current += 1;
    return {
      id: `note-${crypto.randomUUID()}`,
      content: "",
      position: { x, y },
      size: { width: 170, height: 130 },
      zIndex: highestZIndexRef.current,
    };
  };

  const addNoteAtPosition = useCallback((x: number, y: number) => {
    setNotes((prev) => [...prev, createNote(x, y)]);
  }, []);

  const handleAddNoteClick = useCallback(() => {
    setNotes((prev) => {
      const offset = prev.length * 10;
      return [...prev, createNote(50 + offset, 50 + offset)];
    });
  }, []);

  const handleNotesSectionClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (draggingNoteId.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNoteAtPosition(x, y);
    },
    [addNoteAtPosition],
  );

  const bringNoteToFront = useCallback((id: string) => {
    highestZIndexRef.current += 1;
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, zIndex: highestZIndexRef.current } : note,
      ),
    );
  }, []);

  const handleNoteValueChange = useCallback((id: string, value: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content: value } : note)),
    );
  }, []);

  const handleNoteMove = useCallback((id: string, x: number, y: number) => {
    draggingNoteId.current = id;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, position: { x, y } } : note,
      ),
    );
  }, []);

  const handleNoteResize = useCallback(
    (id: string, width: number, height: number) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, size: { width, height } } : note,
        ),
      );
    },
    [],
  );

  const handleNoteDrop = useCallback((mouseX: number, mouseY: number) => {
    const id = draggingNoteId.current;
    draggingNoteId.current = null;

    if (!id) return;

    if (isOverElement(mouseX, mouseY, trashRef.current)) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
  }, []);

  return (
    <div className={styles.notesContainer}>
      <Controls onAdd={handleAddNoteClick} />
      <div
        className={styles.notesSectionWrapper}
        onClick={handleNotesSectionClick}
      >
        {notes.map((note) => (
          <Note
            key={note.id}
            {...note}
            onMove={handleNoteMove}
            onResize={handleNoteResize}
            onChange={(value) => handleNoteValueChange(note.id, value)}
            onFocus={() => bringNoteToFront(note.id)}
            onDrop={handleNoteDrop}
          />
        ))}
      </div>
      <TrashZone ref={trashRef} />
    </div>
  );
};

export default NotesContainer;
