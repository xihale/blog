#!/usr/bin/env bun

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";

const PROJECT_ROOT = process.cwd();
const SOURCE_FONT = join(PROJECT_ROOT, "LXGWWenKai-Regular.ttf");
const OUTPUT_DIR = join(PROJECT_ROOT, "public", "fonts");
const OUTPUT_FONT = join(OUTPUT_DIR, "lxgw.woff2");

/**
 * 获取项目中使用的所有字符
 */
function extractProjectChars(): Set<string> {
  const chars = new Set<string>();

  // 需要扫描的文件扩展名
  const extensions = [".astro", ".md", ".ts", ".js", ".json"];

  // 需要扫描的目录
  const scanDirs = ["src", "public"];

  // 递归扫描文件
  function scanDirectory(dir: string) {
    try {
      const files = execSync(`find "${dir}" -type f`, { encoding: "utf8" });
      const fileList = files.trim().split("\n");

      for (const file of fileList) {
        if (!file) continue;

        // 检查扩展名
        const ext = file.substring(file.lastIndexOf("."));
        if (extensions.includes(ext)) {
          try {
            const content = readFileSync(file, "utf8");
            // 提取所有中文字符和常用符号
            const textChars = content.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\uff00-\uffef]/g);
            if (textChars) {
              textChars.forEach(char => chars.add(char));
            }
          } catch (error) {
            console.warn(`Warning: Could not read file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error);
    }
  }

  for (const dir of scanDirs) {
    const dirPath = join(PROJECT_ROOT, dir);
    if (existsSync(dirPath)) {
      scanDirectory(dirPath);
    }
  }

  // 添加常用字符和符号
  const commonChars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?~'"\\ \t\n\r`;
  const chinesePunctuation = `，。；：？！「」『』（）【】《》〈〉""''`;

  [commonChars, chinesePunctuation].forEach(str => {
    for (const char of str) {
      chars.add(char);
    }
  });

  return chars;
}

/**
 * 使用 fonttools 裁剪字体
 */
function subsetFont(chars: Set<string>): void {
  // 确保输出目录存在
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 将字符转换为 Unicode 范围格式
  const charArray = Array.from(chars).sort();
  const unicodeList = charArray.map(char => {
    const code = char.charCodeAt(0);
    return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
  }).join(",");

  console.log(`Extracted ${charArray.length} unique characters`);
  console.log(`Character range: ${unicodeList.substring(0, 100)}...`);

  try {
    // 使用 pyftsubset 进行字体裁剪
    const cmd = `pyftsubset "${SOURCE_FONT}" \
      --unicodes="${unicodeList}" \
      --output-file="${OUTPUT_FONT}" \
      --flavor=woff2 \
      --layout-features-=* \
      --glyph-names \
      --symbol-cmap \
      --legacy-cmap \
      --notdef-glyph \
      --notdef-outline \
      --recommended-glyphs \
      --name-legacy \
      --drop-tables+=DSIG,LTSH,PCLT,EBSC,MTYP,BASE,GDEF,GPOS,GSUB,JSTF,EBSG,EZDJ,FFTM,OXGS,FEA2,Feat,Silf,Sill,Gloc,Glat \
      --no-hinting`;

    console.log("Running font subsetting command...");
    execSync(cmd, { stdio: "inherit" });

    console.log(`Font subset successfully created at: ${OUTPUT_FONT}`);

    // 显示文件大小对比
    const originalSize = execSync(`wc -c < "${SOURCE_FONT}"`, { encoding: "utf8" }).trim();
    const subsetSize = execSync(`wc -c < "${OUTPUT_FONT}"`, { encoding: "utf8" }).trim();

    console.log(`Original font size: ${(parseInt(originalSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Subset font size: ${(parseInt(subsetSize) / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${((1 - parseInt(subsetSize) / parseInt(originalSize)) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error("Error during font subsetting:", error);
    console.log("\nMake sure you have fonttools installed:");
    console.log("pip install fonttools brotli");
    process.exit(1);
  }
}

/**
 * 检查工具是否安装
 */
function checkTools(): void {
  try {
    execSync("pyftsubset --help", { stdio: "pipe" });
  } catch (error) {
    console.error("Error: pyftsubset not found. Please install fonttools:");
    console.error("pip install fonttools brotli");
    process.exit(1);
  }

  if (!existsSync(SOURCE_FONT)) {
    console.error(`Error: Source font not found at ${SOURCE_FONT}`);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  console.log("🍔 Starting font subsetting process...");

  checkTools();

  console.log("Extracting characters from project...");
  const chars = extractProjectChars();

  console.log("Creating font subset...");
  subsetFont(chars);

  console.log("✅ Font subsetting completed!");
}

// 运行主函数
if (import.meta.main) {
  main();
}
