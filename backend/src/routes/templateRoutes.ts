import express from "express";
import { getCareTemplatesByType } from "../controllers/templateController";

const router = express.Router();

router.get("/care/:careType", getCareTemplatesByType);

export default router;
