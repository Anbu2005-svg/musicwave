import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import likedRoutes from "./routes/liked.routes.js";
import musicRoutes from "./routes/music.routes.js";
import playlistRoutes from "./routes/playlists.routes.js";
import recommendationsRoutes from "./routes/recommendations.routes.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function getClientDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "../client/dist"),
    path.resolve(process.cwd(), "client/dist"),
    path.resolve(moduleDir, "../../../client/dist"),
    path.resolve(moduleDir, "../../client/dist")
  ];

  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.html")));
}

export function createApp() {
  const app = express();
  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
  const clientDistPath = getClientDistPath();

  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'", "https://www.googleapis.com"],
          fontSrc: ["'self'", "https:", "data:"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
          imgSrc: ["'self'", "data:", "https:"],
          mediaSrc: ["'self'", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", "https://www.youtube.com", "https://s.ytimg.com"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"]
        }
      }
    })
  );
  app.use(
    cors({
      origin: clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "musicwave-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/music", musicRoutes);
  app.use("/api/playlists", playlistRoutes);
  app.use("/api/liked", likedRoutes);
  app.use("/api/recommendations", recommendationsRoutes);

  if (clientDistPath) {
    app.use(express.static(clientDistPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      return res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
