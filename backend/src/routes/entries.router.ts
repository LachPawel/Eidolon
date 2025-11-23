import { Router } from "express";
import { EntryController } from "../controllers/index.js";

const entriesRouter = Router();

const entryController = new EntryController();

entriesRouter.post("/", (req, res) => entryController.addEntry(req, res));

export { entriesRouter };