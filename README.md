# 个人博客

基于 Astro 构建的极简个人博客。

## 技术栈

- **Astro** - 静态网站生成器
- **UnoCSS** - 原子化 CSS（用于布局/间距等高复用样式）
- **Expressive Code** - 代码语法高亮

## 开发

```bash
bun dev                # 启动开发服务器
bun build              # 构建生产版本
bun run lint           # 调用 autocorrect 格式化内容
```

## 样式约定

- 样式分层约定见 `src/styles/ARCHITECTURE.md`
- UnoCSS 负责高复用 utility（布局/间距）
- 组件样式优先使用 `*.module.css`
- 内容样式（article/admonition/code）从内容布局按需引入，不再放入全局入口

## License

MIT
