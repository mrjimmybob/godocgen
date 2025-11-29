import express, { Request, Response, NextFunction } from "express";
import templateRoutes from "./routes/templateRoutes";
import dotenv from "dotenv";
import pdfRoutes from "./routes/pdfRoutes";
import careRoutes from "./routes/careRoutes";
import dealerRoutes from "./controllers/dealerController";
import clientRoutes from "./routes/clientRoutes";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" })); // accept JSON bodies
app.use(express.urlencoded({ extended: true }));

import contractRoutes from "./routes/contractRoutes";

// API routes
app.use("/api/templates", templateRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/care", careRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api", clientRoutes);
app.use("/api/contract", contractRoutes);

// health
app.get("/ping", (_req: Request, res: Response) => res.json({ ok: true }));

// simple error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "internal error" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
