import { Router } from "express";
import { EntryController } from "../controllers/index.js";

const entriesRouter = Router();

const entryController = new EntryController();

entriesRouter.get("/:articleId", (req, res) => entryController.getEntries(req, res));
entriesRouter.post("/:articleId", (req, res) => entryController.addEntry(req, res));

export { entriesRouter };