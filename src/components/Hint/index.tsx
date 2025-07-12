import { component$, Slot } from "@qwik.dev/core";

import styles from "./index.module.css";

export default component$((props: { type: "error" | "warning" | "info" }) => {
  return (
    <div class={`${styles.hint} ${styles[props.type]}`}>
      <Slot />
    </div>
  );
});
