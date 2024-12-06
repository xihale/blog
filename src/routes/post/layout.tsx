import { component$, Slot } from "@builder.io/qwik";
import { useDocumentHead } from "@builder.io/qwik-city";

import styles from "./layout.module.css";

export default component$(() => {
  const { title, frontmatter } = useDocumentHead();

  return (
    <>
      <h1 class={styles.title}>{title}</h1>
      <div class={styles.post_meta}>
        <div class={styles.date}>
          {frontmatter.date ? (
            <span class={styles.post_date}>Posted {frontmatter.date}</span>
          ) : (
            <></>
          )}
          {frontmatter.update ? (
            <span class={styles.update_date}>Updated {frontmatter.update}</span>
          ) : (
            <></>
          )}
        </div>
      </div>
      <Slot />
    </>
  );
});
