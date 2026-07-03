import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import likedRoutes from "./routes/liked.routes.js";
import musicRoutes from "./routes/music.routes.js";
import playlistRoutes from "./routes/playlists.routes.js";
import recommendationsRoutes from "./routes/recommendations.routes.js";

export function createApp() {
  const app = express();
  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

  app.disable("x-powered-by");
  app.use(helmet());
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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
