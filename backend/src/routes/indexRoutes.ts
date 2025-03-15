import express from "express";
import { getIndices, getIndexDetails, calculateIndex } from "../controllers/indexController";

const router = express.Router();

router.get("/", getIndices);
router.get("/:id", getIndexDetails);
router.get("/historical", calculateIndex); // Updated to fetch historical indices
router.get("/realtime", calculateIndex); // Updated to fetch real-time indices

export default router;