import express from "express";
import { getServices, createService, updateService, getServiceById, deleteService, getServicesByIds, upload as serviceUpload } from "../controllers/serviceController.js";

const router = express.Router();

// Get services with optional search
router.get("/", getServices);

// Get a service by ID
router.get("/:id", getServiceById);

// Create a new service
router.post("/", serviceUpload.any(), createService);

// Update an existing service
router.put("/:id", serviceUpload.any(), updateService);

// Delete a service
router.delete("/:id", deleteService);

// Get multiple services by IDs
router.post("/byIds", getServicesByIds);

export default router;
