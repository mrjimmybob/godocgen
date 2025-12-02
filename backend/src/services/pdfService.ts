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

    // careDir is now the directory name (e.g. "CARE_4_AÑOS") resolved by the controller
    const careId = careDir; 

    // Load EJS template
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
    // Check both primeraMatriculacion and fechaMatriculacion (fallback)
    let primeraMatriculacion = data.primeraMatriculacion || (data as any).fechaMatriculacion;
    if (primeraMatriculacion) {
        const date = new Date(primeraMatriculacion);
        if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            primeraMatriculacion = `${day}/${month}/${year}`;
        }
    }

    // Format importe to 2 decimal places and add € symbol
    let importe = data.importe;
    if (importe !== undefined && importe !== null) {
        const numImporte = parseFloat(importe.toString());
        if (!isNaN(numImporte)) {
             importe = numImporte.toFixed(2) + " €";
        }
    }

    // Use HTTP URL for assets (requires frontend server running on port 5173)
    // This handles both <%= resUrl %>/fonts/... (double slash is fine) and <%= resUrl %>images/...
    const resUrl = "http://localhost:3000/";

    // Render HTML
    const html = await ejs.render(template, {
        datos: { ...data, primeraMatriculacion, importe },
        datosModelo: data.datosModelo,
        resUrl
    });

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-web-security",
        "--allow-file-access-from-files",
        "--disable-features=IsolateOrigins,site-per-process"
    ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });

    const pdfBuffer = await page.pdf({
        format: "A4",                 // or: width/height in mm
        printBackground: true,
        margin: {
            top: "1.25cm",
            bottom: "1.25cm",
            left: "2.25cm",
            right: "1.25cm"
        },
        preferCSSPageSize: true,      // Important: use @page size from CSS
        scale: 1,                     // no scaling, 1:1
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
}
