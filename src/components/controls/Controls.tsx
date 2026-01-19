import styles from "./Controls.module.css";

type ControlsProps = {
  onAdd: () => void;
};

const Controls = ({ onAdd }: ControlsProps) => (
  <div className={styles.controls}>
    <button
      onClick={onAdd}
      aria-label="Add new note"
      className={styles.addButton}
    >
      Add a new note
    </button>
  </div>
);

export default Controls;
