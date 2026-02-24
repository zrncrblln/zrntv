import express from "express";
import cors from "cors";
import rateLimit from "./middleware/rateLimit.js";
import tmdbRoutes from "./routes/tmdb.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(rateLimit);
app.use("/api/tmdb", tmdbRoutes);

app.get("/", (_, res) => res.json({ status: "ZRN API OK" }));
app.listen(3001, () => console.log("API running on :3001"));