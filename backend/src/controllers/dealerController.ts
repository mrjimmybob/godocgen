import { Router } from "express";
import { getDealers } from "../services/dealerService";


const router = Router();

router.get("/", async (req, res) => {
  try {
    const dealers = await getDealers();
    res.json(dealers);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
