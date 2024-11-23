import { component$ } from "@builder.io/qwik";
import PostCard from "~/components/PostCard";

import styles from "./index.module.css";

// metadata
export const head = {
  title: "@xihale",
  description: "xihale's latest handcraft blog",
};

export default component$(() => {
  const posts = import.meta.glob("./post/*/*.{md,mdx}", { eager: true });

  const infoes = Object.keys(posts)
    .map((path: string): Post => {
      const info = posts[path] as any;
      // 分割 (\d+)\.(\d+)\.(\d+).* 获取 $1 $2 $3 到变量
      let date = info.head.frontmatter.date;
      if (date && date[0].match(/\d/)) {
        const arr = date.match(/\d+/g);
        date =
          arr[0] > 2e3 // Is first param the year or month? 2000+
            ? [arr[0], arr[1], arr[2]]
            : [arr[2], arr[0], arr[1]];
        date = date.map((item: string) => Number(item));
      }
      return {
        href: path.slice(0, path.lastIndexOf("/")),
        title: info.head.title,
        date: date,
        update: info.head.frontmatter.update,
        desc: info.head.frontmatter.desc,
      };
    })
    .sort((a: Post, b: Post) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      for (let i = 0; i < 3; ++i)
        if (a.date[i] !== b.date[i]) return b.date[i] - a.date[i];
      return 0;
    });

  let current_year : number | undefined = Number.MAX_VALUE;

  return (
    <div>
      {infoes.map((info, idx: number) => {
        if (info.date) {
          return (
            <>
              {info.date[0] < current_year! && (current_year = info.date[0]) && (
                <div class={styles.year}>{current_year}</div>
              )}
              <PostCard post={info} key={idx} />
            </>
          );
        } else if (current_year) {
          current_year = undefined;
          return <>
            <div class={styles.year}>Others</div>
            <PostCard post={info} key={idx} />
          </>
        }
        return <PostCard post={info} key={idx} />;
      })}
    </div>
  );
});
