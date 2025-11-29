import { Router } from "express";
import { listCare } from "../controllers/careController";

const router = Router();
router.get("/", listCare);

export default router;
