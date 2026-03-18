export interface LinkItem {
  name: string;
  url: string;
  avatar?: string;
  description: string;
}

export interface LinkGroup {
  title: string;
  description?: string;
  links: LinkItem[];
}

export const linkGroups: LinkGroup[] = [
  {
    title: "Friends",
    description: "朋友们的站点，简洁而有趣。",
    links: [
      {
        name: "teru",
        url: "https://keqing.moe/",
        avatar: "/avatars/teru-avatar.png",
        description: "心有所向，日复一日，必有精进",
      },
      {
        name: "hill",
        url: "https://mutsumi.moe",
        avatar: "/avatars/hill-avatar.webp",
        description: "Just Forward",
      },
      {
        name: "Phrinky",
        url: "https://blog.rkk.moe/",
        avatar: "/avatars/phrinky-avatar.webp",
        description: "可燃性物質です。",
      },
      {
        name: "CZY",
        url: "https://iamczy.com/",
        avatar: "/avatars/czy-avatar.jpg",
        description: "只会吃",
      },
    ],
  },
  {
    title: "Personal Blogs",
    description: "我日常会阅读的一些个人博客。",
    links: [
      {
        name: "评论尸",
        url: "https://1q43.blog/",
        avatar: "/avatars/personal-avatar.png",
        description: "评论尸的自留地",
      },
      {
        name: "最小可读",
        url: "https://mvread.blog/",
        description: "基本无害，可能有用",
      },
      {
        name: "心的道理",
        url: "https://stephenleng.com/cn/",
        avatar: "/avatars/stephenleng.jpg",
        description:
          "Intellectual History, Philosophy of History, and Theory of Human Nature",
      },
    ],
  },
];
