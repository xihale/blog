import { component$ } from "@builder.io/qwik";

import styles from "./index.module.css";
import { Link } from "@builder.io/qwik-city";

interface ItemProps {
  post: Post;
}

export default component$<ItemProps>((props) => {
  const post = props.post;

  const { href, title, desc, date } = post;

  console.log(date);

  return (
    <Link class={styles.card} href={href}>
      <div class={styles.head}>
        <h2 class={styles.title}>{title}</h2>
        {date && (
          <div class={styles.date}>
            {Array.isArray(date) ? `${date[1]}-${date[2]}` : date}
          </div>
        )}
      </div>
      <p class={styles.desc}>{desc}</p>
    </Link>
  );
});
