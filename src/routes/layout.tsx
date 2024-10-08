import { component$, Slot } from "@builder.io/qwik";
import { Link, type RequestHandler } from "@builder.io/qwik-city";

import styles from "./layout.module.css";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div class={styles.layout}>
      <div class={styles.header}>
        <Link class={styles.title} href="/">
          Home
        </Link>
        <Link href="/about">About</Link>
      </div>
      <div class={styles.body}>
        <Slot />
      </div>
      <div class={styles.footer}>
        <div class={styles.copyright}>Copyright &copy; 2024</div>
        <div class={styles.powered}>
          Powered by&nbsp;
          <a href="https://qwik.builder.io/" target="_blank">
            Qwik
          </a>
        </div>
      </div>
    </div>
  );
});
