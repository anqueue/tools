import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const svgPath = path.join(__dirname, "..", "public", "icon.svg");

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(
      __dirname,
      "..",
      "public",
      `icon-${size}x${size}.png`
    );

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }

  console.log("Icons generated successfully!");
}

generateIcons().catch(console.error);
