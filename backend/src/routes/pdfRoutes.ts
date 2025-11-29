import express from "express";
import { generatePdfController } from "../controllers/pdfController";

const router = express.Router();

router.post("/:careDir/:templateName", generatePdfController);

export default router;
