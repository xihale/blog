import { component$ } from "@qwik.dev/core";
import PostCard from "~/components/PostCard";

import styles from "./index.module.css";
import { routeLoader$ } from "@qwik.dev/router";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// metadata
export const head = {
  title: "yume log",
  description: "a blog full of yume",
};

export const usePosts = routeLoader$(async () => {
  const postsDir = path.resolve(process.cwd(), "src/routes/post");
  const postDirs = fs.readdirSync(postsDir).filter((name) => {
    const fullPath = path.join(postsDir, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const posts: Post[] = [];
  for (const dir of postDirs) {
    const filePath = path.join(postsDir, dir, "index.mdx");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      posts.push({
        ...data,
        href: `/post/${dir}`,
        title: data.title || dir,
        date: (() => {
          const arr = String(data.date).match(/\d+/g);
          if (!arr) return undefined;
          return Number(arr[0]) > 2e3
            ? [Number(arr[0]), Number(arr[1]), Number(arr[2])]  // 2023.01.01
            : [Number(arr[2]), Number(arr[0]), Number(arr[1])]; // 01.01.2023
        })(),
        desc: data.desc || "",
      });
    }
  }
  // 按日期排序
  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    for (let i = 0; i < 3; ++i)
      if (a.date[i] !== b.date[i]) return b.date[i] - a.date[i];
    return 0;
  });
  return posts;
});

export default component$(() => {
  const posts = usePosts();

  let current_year: number | undefined = Number.MAX_VALUE;

  return (
    <div>
      {posts.value.map((info: Post, idx: number) => {
        if (info.date) {
          return (
            <>
              {current_year !== info.date[0]
                ? (current_year = info.date[0]) && (
                    <div class={styles.year}>{info.date[0]}</div>
                  )
                : undefined}
              <PostCard post={info} key={idx} />
            </>
          );
        } else if (current_year) {
          current_year = undefined;
          return (
            <>
              <div class={styles.year}>Others</div>
              <PostCard post={info} key={idx} />
            </>
          );
        }
        return <PostCard post={info} key={idx} />;
      })}
    </div>
  );
});
