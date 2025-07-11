import { component$, Slot } from "@qwik.dev/core";
import { useDocumentHead } from "@builder.io/qwik-city";

import styles from "./layout.module.css";

export default component$(() => {
  const { title, frontmatter } = useDocumentHead();

  return (
    <article>
      <h1 class={styles.title}>{title}</h1>
      <div class={styles.post_meta}>
        <div class={styles.license}>license: CC BY 4.0</div>
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
        {frontmatter.category && (
          <div class={styles.category}>
            category:{" "}
            {frontmatter.category.map((item: string, idx: number) => (
              <span class={styles.category_item} key={idx}>
                {item}
              </span>
            ))}
          </div>
        )}
        {frontmatter.tags && frontmatter.category && " | "}
        {frontmatter.tags && (
          <div class={styles.tags}>
            tags:{" "}
            {frontmatter.tags.map((item: string, idx: number) => (
              <span class={styles.tags_item} key={idx}>
                {item}
              </span>
            ))}
          </div>
        )}
        <div class={styles.content}>
          <Slot />
        </div>
      </div>
    </article>
  );
});
