import express from "express";
import { getProtocols, getHistoricalProtocols } from "../controllers/protocolController";

const router = express.Router();

router.get("/", getProtocols);
router.get("/historical", getHistoricalProtocols);

export default router;