import { Request, Response, NextFunction } from "express";
import { protocolService } from "../services/protocolService";
import { insertProtocolSchema } from "@shared/schema";
import { ZodError } from "zod";

class ProtocolController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const protocols = await protocolService.getAllProtocols();
      const ldri = await protocolService.calculateLDRI();
      res.json({ protocols, ldri });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid protocol ID" });
        return;
      }

      const protocol = await protocolService.getProtocolById(id);
      if (!protocol) {
        res.status(404).json({ message: "Protocol not found" });
        return;
      }

      res.json(protocol);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const protocol = insertProtocolSchema.parse(req.body);
      const created = await protocolService.createProtocol(protocol);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
        return;
      }
      next(error);
    }
  }
}

export const protocolController = new ProtocolController();
