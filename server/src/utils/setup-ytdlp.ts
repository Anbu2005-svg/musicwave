import fs from "fs";
import path from "path";
import stream from "stream";
import { promisify } from "util";
import axios from "axios";
import { execSync } from "child_process";

const pipeline = promisify(stream.pipeline);

export async function ensureYtDlp() {
  const platform = process.platform;
  let binaryName = "yt-dlp";
  if (platform === "win32") {
    binaryName = "yt-dlp.exe";
  } else if (platform === "darwin") {
    binaryName = "yt-dlp_macos";
  }

  const binDir = path.join(process.cwd(), "bin");
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const binPath = path.join(binDir, binaryName);

  if (fs.existsSync(binPath)) {
    return binPath;
  }

  console.log(`Downloading ${binaryName} to ${binPath}...`);
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

  try {
    const res = await axios.get(url, {
      responseType: "stream",
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    await pipeline(res.data, fs.createWriteStream(binPath));

    if (platform !== "win32") {
      fs.chmodSync(binPath, "755");
    }

    const stat = fs.statSync(binPath);
    if (stat.size < 1000000) {
      fs.unlinkSync(binPath);
      throw new Error(`Downloaded binary is too small (${stat.size} bytes). Download may have been truncated.`);
    }

    console.log("yt-dlp downloaded successfully!");
    
    // Test the binary
    const version = execSync(`"${binPath}" --version`).toString().trim();
    console.log(`yt-dlp version: ${version}`);

    return binPath;
  } catch (err) {
    if (fs.existsSync(binPath)) {
      try { fs.unlinkSync(binPath); } catch {}
    }
    console.error("Failed to download yt-dlp:", err);
    throw err;
  }
}
