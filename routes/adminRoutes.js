import express from "express";

// ----------------- Controllers -----------------
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  upload as categoryUpload,
} from "../controllers/categoryController.js";

import {
  createService,
  getServices,
  updateService,
  getServiceById,
  deleteService,
  getServicesByIds,
  upload as serviceUpload,
} from "../controllers/serviceController.js";

import {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  upload as subCategoryUpload,
} from "../controllers/subCategoryController.js";

import {
  createVariety,
  getVarieties,
  updateVariety,
  deleteVariety,
  upload as varietyUpload,
} from "../controllers/varietyController.js";

import {
  getAllBookings,
  updateBooking,
  getBookingById,
  getAdminProfile,
  assignPartnerToBooking,
} from "../controllers/adminController.js";

import {
  getPartners,
  getPartnerById
 
  // updatePartner as updatePartnerAdmin,
  // upload as partnerUpload,
} from "../controllers/partners/partnerController.js";

// ----------------- Partner Routes -----------------
import partnerRoutes from "./partners/partnerRoutes.js";

// ----------------- Middleware -----------------
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------- Categories ----------------- */
router.post("/categories",  categoryUpload.single("image"), createCategory);
router.get("/categories",  getCategories);
router.put("/categories/:id",  categoryUpload.single("image"), updateCategory);
router.delete("/categories/:id",  deleteCategory);

/* ----------------- SubCategories ----------------- */
router.post("/subcategories",  subCategoryUpload.single("image"), createSubCategory);
router.get("/subcategories",  getSubCategories);
router.put("/subcategories/:id",  subCategoryUpload.single("image"), updateSubCategory);
router.delete("/subcategories/:id",  deleteSubCategory);

/* ----------------- Varieties ----------------- */
router.post("/varieties", varietyUpload.single("image"), createVariety);
router.get("/varieties", getVarieties);
router.put("/varieties/:id", varietyUpload.single("image"), updateVariety);
router.delete("/varieties/:id", deleteVariety);

/* ----------------- Services ----------------- */
router.post("/services/byIds", getServicesByIds);
router.post("/services", serviceUpload.any(), createService);
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.put("/services/:id", serviceUpload.any(), updateService);
router.delete("/services/:id", deleteService);

/* ----------------- Bookings ----------------- */
router.get("/bookings", getAllBookings);
router.put("/bookings/:id", updateBooking);
router.get("/bookings/:id", getBookingById);

// Assign partner to booking
router.put("/bookings/:id/assign", protect, admin,assignPartnerToBooking);

/* ----------------- Admin Profile ----------------- */
router.get("/profile", protect, admin, getAdminProfile);

/* ----------------- Partner Management ----------------- */
// Admin: list all partners
router.get("/partners", protect, admin, getPartners);

// Admin: get single partner + orders
router.get("/partners/:id", protect, admin, getPartnerById);


// Mount partner-specific routes (login, profile, update for partners themselves)
router.use("/partners", partnerRoutes);

export default router;
