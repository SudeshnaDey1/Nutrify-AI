import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const backendBaseUrl = process.env.BACKEND_API_URL || "http://localhost:8080";

  app.use(express.json());

  app.use("/api", async (req, res, next) => {
    const targetUrl = `${backendBaseUrl}${req.originalUrl}`;
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          headers.set(key, value.join(","));
        } else if (value) {
          headers.set(key, value);
        }
      }
      headers.delete("host");

      const requestInit: RequestInit = {
        method: req.method,
        headers,
      };

      if (!["GET", "HEAD"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        headers.set("content-type", "application/json");
        requestInit.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, requestInit);
      res.status(response.status);

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "content-encoding") {
          res.setHeader(key, value);
        }
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        res.json(await response.json());
        return;
      }

      res.send(await response.text());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", backend: backendBaseUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
