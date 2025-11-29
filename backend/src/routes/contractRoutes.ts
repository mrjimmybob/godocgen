import express from "express";
import { searchContractController } from "../controllers/contractController";

const router = express.Router();

router.post("/search", searchContractController);

export default router;
