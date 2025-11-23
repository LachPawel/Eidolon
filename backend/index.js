import express from "express";
import path from "path";
import { __dirname } from "./const/index.js";
import { readData } from "./utils/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/articles", async (req, res) => {
  try {
    const { organization, status } = req.query;
    let articles = await readData("articles.json", "articles");

    if (organization)
      articles = articles.filter((a) => a.organization === organization);
    if (status) articles = articles.filter((a) => a.status === status);

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: "Failed to load articles" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
