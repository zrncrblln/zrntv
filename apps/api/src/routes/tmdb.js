import express from "express";
import fetch from "node-fetch";
const router = express.Router();
const TMDB_KEY = process.env.TMDB_KEY || "c138886a68189d4f50a36bd5fe53e588";

router.get("/*", async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&${query}`;
  try {
    const r = await fetch(url);
    res.json(await r.json());
  } catch {
    res.status(500).json({ error: "TMDB fetch failed" });
  }
});
export default router;