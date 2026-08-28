import type { ImageMetadata } from "astro";
import teruAvatar from "../assets/images/teru-avatar.png";
import hillAvatar from "../assets/images/hill-avatar.webp";
import phrinkyAvatar from "../assets/images/phrinky-avatar.webp";
import czyAvatar from "../assets/images/czy-avatar.jpg";
import personalAvatar from "../assets/images/personal-avatar.png";
import stephenlengAvatar from "../assets/images/stephenleng.jpg";
import gamernotitleAvatar from "../assets/images/gamernotitle-avatar.png";
import briceAvatar from "../assets/images/brice-avatar.webp";
import wxhAvatar from "../assets/images/wxh-avatar.jpg";
import harlanAvatar from "../assets/images/harlan-avatar.png";

export interface LinkItem {
  name: string;
  url: string;
  avatar?: ImageMetadata;
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
        avatar: teruAvatar,
        description: "心有所向，日复一日，必有精进",
      },
      {
        name: "hill",
        url: "https://yuk1.org",
        avatar: hillAvatar,
        description: "Just Forward",
      },
      {
        name: "Phrinky",
        url: "https://blog.rkk.moe/",
        avatar: phrinkyAvatar,
        description: "可燃性物質です。",
      },
      {
        name: "CZY",
        url: "https://iamczy.com/",
        avatar: czyAvatar,
        description: "只会吃",
      },
      {
        name: "GamerNoTitle",
        url: "https://bili33.top",
        avatar: gamernotitleAvatar,
        description: "The blog of a fameless developer & CTFer. Tech Otakus Save the World.",
      },
      {
        name: "Brice",
        url: "https://brice6.pages.dev/",
        avatar: briceAvatar,
        description: "AI Systems, Mathematics, Computer Science and Quant Blog",
      },
      {
        name: "Harlan",
        url: "https://www.harlan.top",
        avatar: harlanAvatar,
        description: "记录碎片化的所思所想",
      },
      {
        name: "wxh's Blog",
        url: "https://cst-cat.github.io/",
        avatar: wxhAvatar,
        description: "计科学生，折腾技术，记录想法与经验",
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
        avatar: personalAvatar,
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
        avatar: stephenlengAvatar,
        description:
          "Intellectual History, Philosophy of History, and Theory of Human Nature",
      },
      {
        name: "寥雪峰的周报",
        url: "https://www.tianxianzi.me/",
        description: "寥雪峰的周报",
      },
    ],
  },
];
