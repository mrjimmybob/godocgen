// cspell:ignore Chasis
import { Request, Response } from "express";
import { generatePdf } from "../services/pdfService";
import { PdfData } from "../types/PdfData";

import { pool } from "../db/sql";
import sql from "mssql";

export const generatePdfController = async (req: Request, res: Response) => {
    try {
      const { careDir, templateName } = req.params; // careDir here is actually the ID passed from frontend
      const data: PdfData = req.body;
  
      if (!careDir || !templateName || !data)
        return res.status(400).json({ error: "Missing required parameters" });

      // Query DB to get the directory name (Dir) for this careType (careDir is the ID)
      const careType = parseInt(careDir);
      let directoryName = careDir; // Default to passed value if not a number (fallback)

      if (!isNaN(careType)) {
          const result = await pool.request()
            .input("tipo", sql.Int, careType)
            .query("SELECT REPLACE(Nombre, ' ', '_') AS Dir FROM CARE_Tipo WHERE Tipo = @tipo");

          if (result.recordset.length > 0) {
              directoryName = result.recordset[0].Dir;
          } else {
             return res.status(404).json({ error: "Care type not found" });
          }
      }
  
      const pdf = await generatePdf({ careDir: directoryName, templateName, data });
  
      const chasis = data.chasis || "unknown";
      const filename = `${directoryName}-${chasis}.pdf`;
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  
      return res.send(pdf);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      return res.status(500).json({ error: err.message });
    }
  };
