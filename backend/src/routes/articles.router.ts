import { Router } from "express";
import { ArticlesController } from "../controllers/index.js";

const articlesRouter = Router();

const articlesController = new ArticlesController();

articlesRouter.get("/", (req, res) => articlesController.getArticles(req, res));
articlesRouter.post("/", (req, res) => articlesController.addArticle(req, res));

export { articlesRouter };
