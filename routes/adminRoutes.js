import express from "express";

// Controllers for categories, subcategories, varieties, services
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

// Controllers for bookings
import {
  getAllBookings,
  updateBooking,getBookingById,
} from "../controllers/adminController.js";

const router = express.Router();

// ----------------- Categories -----------------
router.post("/categories", categoryUpload.single("image"), createCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", categoryUpload.single("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

// ----------------- SubCategories -----------------
router.post("/subcategories", subCategoryUpload.single("image"), createSubCategory);
router.get("/subcategories", getSubCategories);
router.put("/subcategories/:id", subCategoryUpload.single("image"), updateSubCategory);
router.delete("/subcategories/:id", deleteSubCategory);

// ----------------- Varieties -----------------
router.post("/varieties", varietyUpload.single("image"), createVariety);
router.get("/varieties", getVarieties);
router.put("/varieties/:id", varietyUpload.single("image"), updateVariety);
router.delete("/varieties/:id", deleteVariety);

// ----------------- Services -----------------
router.post("/services/byIds", getServicesByIds);
router.post("/services", serviceUpload.any(), createService);
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.put("/services/:id", serviceUpload.any(), updateService);
router.delete("/services/:id", deleteService);

// ----------------- Bookings -----------------
router.get("/bookings", getAllBookings);
router.put("/bookings/:id", updateBooking);
router.get("/bookings/:id", getBookingById); 
export default router;
