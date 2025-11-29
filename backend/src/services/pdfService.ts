import ejs from "ejs";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { PdfData } from "../types/PdfData";

export interface GeneratePdfParams {
  careDir: string;
  templateName: string;
  data: PdfData;
}

export async function generatePdf(params: GeneratePdfParams): Promise<Buffer> {

    const { careDir, templateName, data } = params;

    // 3. Load EJS template
    const filePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "care",
        careDir,
        templateName
    );

    if (!fs.existsSync(filePath)) {
        throw new Error(`Template not found: ${filePath}`);
    }

    const template = fs.readFileSync(filePath, "utf8");

    // 4. Render HTML
    const html = await ejs.render(template, data);

    // 5. Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
}
