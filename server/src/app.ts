import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.routes.js";
import likedRoutes from "./routes/liked.routes.js";
import musicRoutes from "./routes/music.routes.js";
import playlistRoutes from "./routes/playlists.routes.js";
import recommendationsRoutes from "./routes/recommendations.routes.js";
import { ApiError } from "./utils/ApiError.js";

function allowedOrigins() {
  return new Set(
    [
      process.env.CLIENT_URL,
      process.env.CLIENT_URLS,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://localhost",
      "capacitor://localhost",
      "ionic://localhost"
    ]
      .filter(Boolean)
      .flatMap((origin) => origin!.split(","))
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

export function createApp() {
  const app = express();
  const origins = allowedOrigins();

  console.log(`Allowed CORS origins: ${[...origins].join(", ")}`);

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new ApiError(403, "Origin not allowed"));
      },
      credentials: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", apiLimiter);

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
