import express, { Request, Response, NextFunction } from "express";
import templateRoutes from "./routes/templateRoutes";
import dotenv from "dotenv";
import pdfRoutes from "./routes/pdfRoutes";
import careRoutes from "./routes/careRoutes";
import dealerRoutes from "./controllers/dealerController";
import clientRoutes from "./routes/clientRoutes";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import contractRoutes from "./routes/contractRoutes";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" })); // accept JSON bodies
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Serve fonts and images exactly as old templates expect
app.get("/fonts/:file", (req, res, next) => {
  const file = req.params.file;

  // If the template requests .eot → ALWAYS serve .ttf instead
  if (file.endsWith(".eot") || file.includes(".eot")) {
    const ttf = file.replace(/\.eot.*/, ".ttf");
    const fontPath = path.join(process.cwd(), "static", "fonts", ttf);

    if (fs.existsSync(fontPath)) {
      res.setHeader("Content-Type", "font/ttf");
      return res.sendFile(fontPath);
    }
  }

  next(); // continue to normal static serving
});
app.use("/fonts", express.static(path.join(process.cwd(), "static", "fonts")));
app.use("/images", express.static(path.join(process.cwd(), "static", "images")));
app.use("/css", express.static(path.join(process.cwd(), "static", "css")));


// API routes
app.use("/api/templates", templateRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/care", careRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api", clientRoutes);
app.use("/api/contract", contractRoutes);

// server correct mime types
mime.lookup("toyota-text.eot"); // should be application/vnd.ms-fontobject
mime.lookup("toyota-text.svg"); // should be image/svg+xml
mime.lookup("toyota-text.ttf"); // should be application/x-font-ttf
mime.lookup("toyota-text.woff"); // should be application/x-font-woff
mime.lookup("toyota-text.woff2"); // should be application/x-font-woff2
mime.lookup("toyota-display.eot"); // should be application/vnd.ms-fontobject
mime.lookup("toyota-display.svg"); // should be image/svg+xml
mime.lookup("toyota-display.ttf"); // should be application/x-font-ttf
mime.lookup("toyota-display.woff"); // should be application/x-font-woff
mime.lookup("toyota-display.woff2"); // should be application/x-font-woff2

// health
app.get("/ping", (_req: Request, res: Response) => res.json({ ok: true }));

// simple error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "internal error" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

