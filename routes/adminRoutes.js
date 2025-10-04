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
router.post("/categories", protect, admin, categoryUpload.single("image"), createCategory);
router.get("/categories", protect, admin, getCategories);
router.put("/categories/:id", protect, admin, categoryUpload.single("image"), updateCategory);
router.delete("/categories/:id", protect, admin, deleteCategory);

/* ----------------- SubCategories ----------------- */
router.post("/subcategories", protect, admin, subCategoryUpload.single("image"), createSubCategory);
router.get("/subcategories", protect, admin, getSubCategories);
router.put("/subcategories/:id", protect, admin, subCategoryUpload.single("image"), updateSubCategory);
router.delete("/subcategories/:id", protect, admin, deleteSubCategory);

/* ----------------- Varieties ----------------- */
router.post("/varieties", protect, admin, varietyUpload.single("image"), createVariety);
router.get("/varieties", protect, admin, getVarieties);
router.put("/varieties/:id", protect, admin, varietyUpload.single("image"), updateVariety);
router.delete("/varieties/:id", protect, admin, deleteVariety);

/* ----------------- Services ----------------- */
router.post("/services/byIds", protect, admin, getServicesByIds);
router.post("/services", protect, admin, serviceUpload.any(), createService);
router.get("/services", protect, admin, getServices);
router.get("/services/:id", protect, admin, getServiceById);
router.put("/services/:id", protect, admin, serviceUpload.any(), updateService);
router.delete("/services/:id", protect, admin, deleteService);

/* ----------------- Bookings ----------------- */
router.get("/bookings", protect, admin, getAllBookings);
router.put("/bookings/:id", protect, admin, updateBooking);
router.get("/bookings/:id", protect, admin, getBookingById);

// Assign partner to booking
router.put("/bookings/:id/assign", protect, admin, assignPartnerToBooking);

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
