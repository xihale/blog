#!/usr/bin/env bun

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();
const FONT_CACHE_DIR = join(PROJECT_ROOT, ".fonts");
const SOURCE_FONT = join(FONT_CACHE_DIR, "LXGWWenKai-Regular.ttf");
const OUTPUT_DIR = join(PROJECT_ROOT, "public", "fonts");
const OUTPUT_FONT = join(OUTPUT_DIR, "lxgw.woff2");
const LOCAL_FONT_CANDIDATES = [
  "/usr/share/fonts/TTF/LXGWWenKai-Regular.ttf",
];

const FONT_DOWNLOAD_URLS = [
  "https://github.com/lxgw/LxgwWenKai/releases/latest/download/LXGWWenKai-Regular.ttf",
  "https://cdn.jsdelivr.net/gh/lxgw/LxgwWenKai@latest/LXGWWenKai-Regular.ttf",
  "https://fastly.jsdelivr.net/gh/lxgw/LxgwWenKai@latest/LXGWWenKai-Regular.ttf",
];
// SHA256 Checksum for LXGWWenKai-Regular.ttf
const FONT_SHA256 = "b64b7add297672bf04c54ce229678ddf09b4f9671cb1ece1f24c868f4226edd0";
const DOWNLOAD_TIMEOUT_MS = 30000;

let subsetCommand: string[] | null = null;

function trySpawn(command: string, args: string[] = []): boolean {
  try {
    const result = Bun.spawnSync([command, ...args], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

function resolveSubsetCommand(): string[] {
  if (subsetCommand) return subsetCommand;

  if (trySpawn("pyftsubset", ["--help"])) {
    subsetCommand = ["pyftsubset"];
    return subsetCommand;
  }

  const pythonCandidates = ["python3", "python"];
  for (const python of pythonCandidates) {
    if (!trySpawn(python, ["--version"])) continue;

    try {
      const importCheck = Bun.spawnSync([python, "-c", "import fontTools"], {
        stdout: "ignore",
        stderr: "ignore",
      });
      if (importCheck.exitCode === 0) {
        subsetCommand = [python, "-m", "fontTools.subset"];
        return subsetCommand;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    "pyftsubset command is unavailable. Install fonttools (pip install fonttools brotli) and ensure either 'pyftsubset' is in PATH or Python can import fontTools."
  );
}

function assertNonEmptyFile(filePath: string, label: string): void {
  const file = Bun.file(filePath);
  if (!existsSync(filePath) || file.size === 0) {
    throw new Error(`${label} is missing or empty: ${filePath}`);
  }
}

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
  const glob = new Bun.Glob("**/*.{astro,md,mdx,ts,tsx,js,jsx,json,html,xml,xsl,txt}");
  
  // 扫描 src 和 public 目录
  const scanDirs = ["src", "public"];
  
  console.log("Scanning files...");
  
  for (const dir of scanDirs) {
    // Bun.Glob.scan 返回的是相对路径，我们需要结合 cwd
    for await (const file of glob.scan({ cwd: join(PROJECT_ROOT, dir), absolute: true })) {
        try {
            const content = await Bun.file(file).text();
            // 提取所有中文字符和常用符号
            const textChars = content.match(/[\p{Script=Han}\u{3000}-\u{303F}\u{FF00}-\u{FFEF}]/gu);
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

  for (const localFontPath of LOCAL_FONT_CANDIDATES) {
    if (!existsSync(localFontPath)) continue;

    const isLocalFontValid = await verifyFileHash(localFontPath, FONT_SHA256);
    if (!isLocalFontValid) continue;

    await Bun.write(SOURCE_FONT, Bun.file(localFontPath));
    assertNonEmptyFile(SOURCE_FONT, "Cached source font");
    console.log(`Using local system font: ${localFontPath}`);
    return;
  }

  for (const fontDownloadURL of FONT_DOWNLOAD_URLS) {
    console.log(`Downloading font from ${fontDownloadURL}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(fontDownloadURL, {
        signal: controller.signal,
        redirect: "follow",
      });
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

      await Bun.write(SOURCE_FONT, response);

      if (!await verifyFileHash(SOURCE_FONT, FONT_SHA256)) {
        console.error("❌ Downloaded file verification failed! Trying next mirror...");
        continue;
      }

      assertNonEmptyFile(SOURCE_FONT, "Downloaded source font");
      console.log("Font downloaded successfully!");
      return;
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === "AbortError";
      if (isAbortError) {
        console.error(`Error downloading from ${fontDownloadURL}: request timed out after ${DOWNLOAD_TIMEOUT_MS / 1000}s.`);
      } else {
        console.error(`Error downloading from ${fontDownloadURL}:`, error);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  console.error("Error downloading font: all download sources failed.");
  console.error(`Please manually download LXGWWenKai-Regular.ttf to ${SOURCE_FONT} and rerun.`);
  process.exit(1);
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
  const unicodeList = charArray.flatMap(char => {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) return [];

    return [`U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`];
  }).join(",");

  console.log(`Extracted ${charArray.length} unique characters`);
  
  const command = subsetCommand ?? resolveSubsetCommand();
  const args = [
      ...command,
      SOURCE_FONT,
      `--unicodes=${unicodeList}`,
      `--output-file=${OUTPUT_FONT}`,
      "--flavor=woff2",
      "--layout-features-=*",
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

  console.log("Running font subsetting...");
  
  try {
    const proc = Bun.spawnSync(args, {
        stdout: "inherit",
        stderr: "inherit"
    });

    if (proc.exitCode !== 0) {
        throw new Error(`Font subset command exited with code ${proc.exitCode}`);
    }

    assertNonEmptyFile(OUTPUT_FONT, "Subset font output");

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
    const command = resolveSubsetCommand();
    console.log(`Using font subset command: ${command.join(" ")}`);
  } catch (error) {
    console.error("Error: pyftsubset (or Python fontTools) not found.");
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error("Please install fonttools via: pip install fonttools brotli");
    console.error("Ensure either 'pyftsubset' is in PATH or Python can import fontTools.");
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
  main().catch((error) => {
    console.error("Fatal error during font subsetting:", error);
    process.exit(1);
  });
}
