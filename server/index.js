import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import healthRouter from "./routes/health.js";

const app = express();
const port = process.env.PORT || 5173;

// Security headers
app.use(helmet());

// ── Global rate limiter ──────────────────────────────────────
// 100 requests per 15 minutes per IP across all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// CORS — restrict to known origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tukinlisbon.com",
  "https://www.tukinlisbon.com",
  // Add Vercel preview and production URLs
  /https:\/\/.*\.vercel\.app$/,
];
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Check if origin is in allowed list or matches regex patterns
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Body size limits
app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Export app for testing; only listen when run directly
export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
