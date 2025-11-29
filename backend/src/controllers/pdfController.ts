// cspell:ignore Chasis
import { Request, Response } from "express";
import { generatePdf } from "../services/pdfService";
import { PdfData } from "../types/PdfData";

export const generatePdfController = async (req: Request, res: Response) => {
    try {
      const { careDir, templateName } = req.params;
      const data: PdfData = req.body;
  
      if (!careDir || !templateName || !data)
        return res.status(400).json({ error: "Missing required parameters" });
  
      const pdf = await generatePdf({ careDir, templateName, data });
  
      const chasis = data.chasis || "unknown";
      const filename = `${careDir}-${chasis}.pdf`;
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  
      return res.send(pdf);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      return res.status(500).json({ error: err.message });
    }
  };
