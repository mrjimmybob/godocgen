import fs from "fs/promises";
import path from "path";
import { TemplateInfo } from "../types";

const TEMPLATE_ROOT = process.env.TEMPLATE_ROOT ?? path.join(__dirname, "../templates");

export async function listTemplates(type: string): Promise<TemplateInfo[]> {
  const dir = path.join(TEMPLATE_ROOT, type);
  console.log(dir);
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    return files
      .filter((f) => f.isFile() && f.name.endsWith(".ejs"))
      .map((f) => ({
        name: f.name,
        path: path.join(dir, f.name),
        type,
      }));
  } catch (err) {
    // if folder missing return empty; controllers decide response
    if ((err as any)?.code === "ENOENT") return [];
    throw err;
  }
}
