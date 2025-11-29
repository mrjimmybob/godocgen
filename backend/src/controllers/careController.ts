import { Request, Response } from "express";
import { getCareDocuments } from "../services/careService";

export async function listCare(req: Request, res: Response) {
  try {
    const docs = await getCareDocuments();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as any)?.message ?? "db error" });
  }
}
