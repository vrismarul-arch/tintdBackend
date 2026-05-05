import express from "express";
const router = express.Router();

import {
  createMakeup,
  getMakeups,
  updateMakeup,
  deleteMakeup,
} from "../controllers/makeupController.js";

router.post("/", createMakeup);
router.get("/", getMakeups);

// NEW
router.put("/:id", updateMakeup);
router.delete("/:id", deleteMakeup);

export default router;