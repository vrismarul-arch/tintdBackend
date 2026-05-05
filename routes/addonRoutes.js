// routes/addonRoutes.js
import express from 'express';
import {
  getAddons,           // Changed from getAddOns to getAddons
  getAddonById,
  createAddon,
  updateAddon,
  deleteAddon,
  getAddonStats
} from '../controllers/addonController.js';

const router = express.Router();

router.route('/')
  .get(getAddons)      // Changed from getAddOns to getAddons
  .post(createAddon);

router.route('/stats')
  .get(getAddonStats);

router.route('/:id')
  .get(getAddonById)
  .put(updateAddon)
  .delete(deleteAddon);

export default router;