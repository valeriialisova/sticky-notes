import { forwardRef } from "react";

import styles from "./TrashZone.module.css";

const TrashZone = forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className={styles.trashSection}>
    Drag note here to remove
  </div>
));

export default TrashZone;
