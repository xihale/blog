#!/usr/bin/env bun

import { existsSync, mkdirSync } from "node:fs"; // Keep node:fs for sync checks if needed, or switch to Bun completely
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();
const FONT_CACHE_DIR = join(PROJECT_ROOT, ".fonts");
const SOURCE_FONT = join(FONT_CACHE_DIR, "LXGWWenKai-Regular.ttf");
const OUTPUT_DIR = join(PROJECT_ROOT, "public", "fonts");
const OUTPUT_FONT = join(OUTPUT_DIR, "lxgw.woff2");

const FONT_DOWNLOAD_URL = "https://github.com/lxgw/LxgwWenKai/releases/latest/download/LXGWWenKai-Regular.ttf";
// SHA256 Checksum for LXGWWenKai-Regular.ttf
const FONT_SHA256 = "b64b7add297672bf04c54ce229678ddf09b4f9671cb1ece1f24c868f4226edd0";

/**
 * 校验文件哈希
 */
async function verifyFileHash(filePath: string, expectedHash: string): Promise<boolean> {
  try {
    const fileBuffer = await Bun.file(filePath).arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    if (hashHex === expectedHash) {
      console.log("✅ File checksum verification passed.");
      return true;
    } else {
      console.error(`❌ Checksum verification failed!`);
      console.error(`   Expected: ${expectedHash}`);
      console.error(`   Actual:   ${hashHex}`);
      return false;
    }
  } catch (error) {
    console.error("Error verifying hash:", error);
    return false;
  }
}

/**
 * 获取项目中使用的所有字符
 */
async function extractProjectChars(): Promise<Set<string>> {
  const chars = new Set<string>();
  
  // 使用 Bun.Glob 扫描文件，替代 shell find 命令
  const glob = new Bun.Glob("**/*.{astro,md,ts,js,json}");
  
  // 扫描 src 和 public 目录
  const scanDirs = ["src", "public"];
  
  console.log("Scanning files...");
  
  for (const dir of scanDirs) {
    // Bun.Glob.scan 返回的是相对路径，我们需要结合 cwd
    for await (const file of glob.scan({ cwd: join(PROJECT_ROOT, dir), absolute: true })) {
        try {
            const content = await Bun.file(file).text();
            // 提取所有中文字符和常用符号
            const textChars = content.match(/[一-鿿㐀-䶿豈-﫿＀-￯]/g);
            if (textChars) {
                textChars.forEach((char: string) => {
                    chars.add(char);
                });
            }
        } catch (error) {
            console.warn(`Warning: Could not read file ${file}:`, error);
        }
    }
  }

  // 添加常用字符和符号
  const commonChars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?~'"\ 	
`;
  const chinesePunctuation = `，。；：？！「」『』（）【】《》〈〉""''`;

  [commonChars, chinesePunctuation].forEach(str => {
    for (const char of str) {
      chars.add(char);
    }
  });

  return chars;
}

/**
 * 下载字体文件 (使用 Bun 原生 fetch)
 */
async function downloadFont() {
  if (!existsSync(FONT_CACHE_DIR)) {
    mkdirSync(FONT_CACHE_DIR, { recursive: true });
  }

  if (existsSync(SOURCE_FONT)) {
    console.log("Using cached font:", SOURCE_FONT);
    if (!await verifyFileHash(SOURCE_FONT, FONT_SHA256)) {
        console.error("Cached font is corrupted or tampered. Deleting...");
        // 这里的 unlinkSync 是 Node 的，Bun 也有自己的 unlink，但为了兼容性或简单起见
        // 既然我们之前用了 existsSync (node)，这里可以用 fs.unlinkSync，或者直接 Bun.write 覆盖
        // 为保持纯 Bun 风格，我们可以直接继续下载流程覆盖它
    } else {
        return;
    }
  }

  console.log(`Downloading font from ${FONT_DOWNLOAD_URL}...`);
  try {
    const response = await fetch(FONT_DOWNLOAD_URL);
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
    
    await Bun.write(SOURCE_FONT, response);
    console.log("Font downloaded successfully!");
    
    // Verify again after download
    if (!await verifyFileHash(SOURCE_FONT, FONT_SHA256)) {
        console.error("❌ Downloaded file verification failed! The file may be compromised.");
        process.exit(1);
    }
    
  } catch (error) {
    console.error("Error downloading font:", error);
    process.exit(1);
  }
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
  
  // 使用 Bun.spawnSync 安全调用外部命令 (避免 shell 注入)
  const args = [
      "pyftsubset",
      SOURCE_FONT,
      `--unicodes=${unicodeList}`,
      `--output-file=${OUTPUT_FONT}`,
      "--flavor=woff2",
      "--layout-features-='*'", // 注意：在数组参数中不需要引号包裹 *，除非是 shell 解析。这里直接传值
      "--glyph-names",
      "--symbol-cmap",
      "--legacy-cmap",
      "--notdef-glyph",
      "--notdef-outline",
      "--recommended-glyphs",
      "--name-legacy",
      "--drop-tables+=DSIG,LTSH,PCLT,EBSC,MTYP,BASE,GDEF,GPOS,GSUB,JSTF,EBSG,EZDJ,FFTM,OXGS,FEA2,Feat,Silf,Sill,Gloc,Glat",
      "--no-hinting"
  ];
  
  // 修正 layout-features 参数，Bun spawn 不需要 shell 转义
  // pyftsubset 参数有些特殊，shell 中是 --layout-features-='*', 直接调用时可能是 --layout-features-=*
  // 为了安全和兼容，我们微调一下 args
  const cleanArgs = args.map(arg => {
      if (arg.startsWith("--layout-features")) return "--layout-features-=*"; 
      return arg;
  });

  console.log("Running font subsetting...");
  
  try {
    const proc = Bun.spawnSync(cleanArgs, {
        stdout: "inherit",
        stderr: "inherit"
    });

    if (proc.exitCode !== 0) {
        throw new Error(`pyftsubset exited with code ${proc.exitCode}`);
    }

    console.log(`Font subset successfully created at: ${OUTPUT_FONT}`);

    // 显示文件大小对比
    const originalSize = Bun.file(SOURCE_FONT).size;
    const subsetSize = Bun.file(OUTPUT_FONT).size;

    console.log(`Original font size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Subset font size: ${(subsetSize / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${((1 - subsetSize / originalSize) * 100).toFixed(1)}%`);

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
    const proc = Bun.spawnSync(["pyftsubset", "--help"], { stdout: "ignore", stderr: "ignore" });
    if (proc.exitCode !== 0) throw new Error("Not found");
  } catch (error) {
    console.error("Error: pyftsubset not found. Please install fonttools:");
    console.error("pip install fonttools brotli");
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🍔 Starting font subsetting process (Powered by Bun)...");

  checkTools();
  await downloadFont();

  console.log("Extracting characters from project...");
  const chars = await extractProjectChars();

  console.log("Creating font subset...");
  subsetFont(chars);

  console.log("✅ Font subsetting completed!");
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
