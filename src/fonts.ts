import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../assets/fonts/", import.meta.url));

/** The font files renderPdf() and renderImage() draw with. Nothing is fetched at render time. */
export async function loadFonts() {
  const f = (name: string) => readFile(dir + name);
  return [
    { family: "Inter", src: await f("Inter-400.ttf"), weight: 400 },
    { family: "Inter", src: await f("Inter-500.ttf"), weight: 500 },
    { family: "Inter", src: await f("Inter-600.ttf"), weight: 600 },
    { family: "Inter", src: await f("Inter-700.ttf"), weight: 700 },
    { family: "Source Serif Pro", src: await f("SourceSerifPro-Regular.ttf"), weight: 400 },
    { family: "Source Serif Pro", src: await f("SourceSerifPro-It.ttf"), weight: 400, style: "italic" as const },
    { family: "Source Serif Pro", src: await f("SourceSerifPro-Semibold.ttf"), weight: 600 },
    { family: "Source Serif Pro", src: await f("SourceSerifPro-Bold.ttf"), weight: 700 },
  ];
}
