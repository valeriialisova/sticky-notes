export type NotePosition = { x: number; y: number };
export type NoteSize = { width: number; height: number };

export type NoteType = {
  id: string;
  content: string;
  position: NotePosition;
  size: NoteSize;
  zIndex: number;
};
