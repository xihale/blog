import { component$ } from "@qwik.dev/core";

import styles from "./index.module.css";
import { Link } from "@builder.io/qwik-city";

interface ItemProps {
  post: Post;
}

export default component$<ItemProps>((props) => {
  const post = props.post;

  const { href, title, desc, date } = post;

  return (
    <Link class={styles.card} href={href}>
      <div class={styles.head}>
        <h2 class={styles.title}>{title}</h2>
        {date && (
          <div class={styles.date}>
            {Array.isArray(date) ? `${date[1].toString().padStart(2, '0')}-${date[2].toString().padStart(2, '0')}` : date}
          </div>
        )}
      </div>
      <p class={styles.desc}>{desc}</p>
    </Link>
  );
});
