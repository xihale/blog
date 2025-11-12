# 字体裁剪自动化

本项目使用自动化脚本来根据项目中实际使用的字符裁剪 LXGW WenKai 字体，以减少字体文件大小并提升加载性能。

## 功能特性

- 🎯 **智能字符提取**: 自动扫描项目中的所有源文件，提取实际使用的字符
- 📦 **体积优化**: 将 25MB 的原字体文件裁剪为几十 KB 的子集
- 🚀 **自动化集成**: 构建时自动执行，无需手动操作
- 🔄 **CI/CD 支持**: 在 GitHub Actions 中自动运行

## 使用方法

### 本地开发

1. **安装字体工具** (首次使用):
   ```bash
   pip install fonttools brotli
   ```

2. **生成裁剪字体**:
   ```bash
   bun run subset-font
   ```

3. **构建项目** (会自动运行字体裁剪):
   ```bash
   bun run build
   ```

### 开发环境

开发环境不会自动运行字体裁剪，以提高启动速度。如果需要：
```bash
bun run subset-font && bun run dev
```

## 文件说明

- `scripts/subset-font.ts`: 字体裁剪脚本
- `public/fonts/lxgw.woff2`: 裁剪后的字体文件 (自动生成)
- `LXGWWenKai-Regular.ttf`: 原始字体文件 (根目录)

## 脚本工作原理

1. **字符扫描**: 扫描 `src/` 和 `public/` 目录中的所有 `.astro`, `.md`, `.ts`, `.js`, `.json` 文件
2. **字符提取**: 提取中文字符、中文标点和常用符号
3. **字符补全**: 添加常用的英文字符、数字和符号
4. **字体裁剪**: 使用 `pyftsubset` 工具根据字符集生成 WOFF2 格式的子集

## 性能优化

- **原字体大小**: ~25 MB (TTF)
- **裁剪后大小**: ~50-200 KB (WOFF2)
- **压缩比**: 99%+
- **加载方式**: 预加载 + font-display: swap

## 故障排除

### 字体工具未安装
```bash
Error: pyftsubset not found
```
解决方案:
```bash
pip install fonttools brotli
```

### 字体文件不存在
```bash
Error: Source font not found at LXGWWenKai-Regular.ttf
```
确保根目录存在 `LXGWWenKai-Regular.ttf` 文件。

### 权限问题
如果遇到权限问题，确保脚本有执行权限:
```bash
chmod +x scripts/subset-font.ts
```

## 手动更新字体

如果项目内容发生变化，需要重新生成字体子集：
```bash
bun run subset-font
```

或者重新构建整个项目：
```bash
bun run build
```

## 技术细节

- **字符范围**: 支持 CJK Unified Ideographs、CJK Extension A/B、兼容字符等
- **输出格式**: WOFF2 (高压缩比)
- **字体特性**: 禁用大部分 OpenType 特性以减小体积
- **回退方案**: 使用系统字体作为回退