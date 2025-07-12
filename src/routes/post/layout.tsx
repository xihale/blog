import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { useDocumentHead } from "@builder.io/qwik-city";

import styles from "./layout.module.css";

import shikiStyle from "@/shiki.css?inline";
import katexStyle from "katex/dist/katex.min.css?inline";

export default component$(() => {
  const { title, frontmatter } = useDocumentHead();
  
  // TODO: 检测 文档中是否包含代码块

  useStyles$(shikiStyle);
  useStyles$(katexStyle);

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
      </div>
      <div class={styles.content}>
        <Slot />
      </div>
    </article>
  );
});
