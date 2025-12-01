import { Request, Response } from "express";
import path from "path";
import fs from "fs";


export const getCareTemplatesByType = async (req: Request, res: Response) => {
  try {
    const careType = parseInt(req.params.careType);
    if (isNaN(careType)) return res.status(400).json({ error: "Invalid care type" });

    const dir = careType.toString();

    const templatesPath = path.join(process.cwd(), "src", "templates", "care", dir);

    if (!fs.existsSync(templatesPath)) {
      return res.status(404).json({ error: "Template directory not found" });
    }

    const files = fs
      .readdirSync(templatesPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ejs"))
      .map((file) => ({
        name: file.name
      }));

    return res.json(files);
  } catch (err: any) {
    console.error("Error loading templates:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
