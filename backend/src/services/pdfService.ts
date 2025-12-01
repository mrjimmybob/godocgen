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

    // Extract ID from careDir (e.g. "CARE1" -> "1")
    const careId = careDir.replace("CARE", "");

    // 3. Load EJS template
    const filePath = path.join(
        process.cwd(),
        "src",
        "templates",
        "care",
        careId,
        templateName
    );

    if (!fs.existsSync(filePath)) {
        throw new Error(`Template not found: ${filePath}`);
    }

    const template = fs.readFileSync(filePath, "utf8");

    // Format date to DD/MM/YYYY
    let primeraMatriculacion = data.primeraMatriculacion;
    if (primeraMatriculacion && primeraMatriculacion.includes("T")) {
        const date = new Date(primeraMatriculacion);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        primeraMatriculacion = `${day}/${month}/${year}`;
    }

    // Resolve static directory path for file:// protocol
    // Assuming backend is at process.cwd() and frontend is at ../frontend
    const staticDir = path.resolve(process.cwd(), "../frontend/static");
    // Ensure forward slashes for URL and add trailing slash
    const resUrl = "file:///" + staticDir.replace(/\\/g, "/") + "/";

    // 4. Render HTML
    const html = await ejs.render(template, {
        datos: { ...data, primeraMatriculacion },
        datosModelo: data.datosModelo,
        resUrl
    });

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
