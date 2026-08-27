#!/usr/bin/env node
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , imagePath, expectedZone = "unknown"] = process.argv;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const localEnvPath = path.join(appRoot, ".env.local");

if (existsSync(localEnvPath)) {
  const localEnv = await readFile(localEnvPath, "utf8");
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

if (!imagePath) {
  console.error("Usage: node scripts/validate-image.mjs <image-path> [expected-zone]");
  process.exit(2);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is missing. Refusing to produce fake OCR/vision results.");
  process.exit(2);
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const cwdImagePath = path.resolve(imagePath);
const appImagePath = path.resolve(appRoot, imagePath);
const absoluteImagePath = existsSync(cwdImagePath) ? cwdImagePath : appImagePath;
const imageBuffer = await readFile(absoluteImagePath);
const ext = path.extname(absoluteImagePath).toLowerCase();
const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
const base64Image = imageBuffer.toString("base64");

const prompt = `
You are validating a museum-guide vision workflow for the Delaware County Institute of Science.

Analyze this image as a real visitor/staff camera input. Return compact JSON only:
{
  "likely_zone": string,
  "expected_zone": ${JSON.stringify(expectedZone)},
  "confidence": number between 0 and 1,
  "visible_text": string[],
  "objects_or_features": string[],
  "guide_context": string,
  "uncertainties": string[],
  "pass_for_mvp": boolean
}

MVP standard: it does not need to identify every specimen. It must identify a useful room, case, zone, label, or landmark well enough to ground a guide response or ask a clarifying question.
`;

const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_completion_tokens: 900,
  }),
});

const body = await response.json();

if (!response.ok) {
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const output = body.choices?.[0]?.message?.content ?? "";
await mkdir("validation-results", { recursive: true });

const safeName = path.basename(absoluteImagePath).replace(/[^a-zA-Z0-9._-]/g, "_");
const resultPath = path.join("validation-results", `${Date.now()}-${safeName}.json`);
await writeFile(resultPath, output.endsWith("\n") ? output : `${output}\n`);

console.log(`Wrote ${resultPath}`);
