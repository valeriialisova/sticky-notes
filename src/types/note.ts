export interface NotePosition {
  x: number;
  y: number;
}
export interface NoteSize {
  width: number;
  height: number;
}

export interface NoteType {
  id: string;
  content: string;
  position: NotePosition;
  size: NoteSize;
  zIndex: number;
}
