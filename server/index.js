import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";

dotenv.config();

const app = express();
const port = 1234;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
