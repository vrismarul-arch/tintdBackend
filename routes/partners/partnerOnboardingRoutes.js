import express from "express";
import { submitStep, getPartners, upload } from "../../controllers/partners/partnerController.js";

const router = express.Router();

router.post(
  "/submit",
  upload.fields([
    { name: "aadhaarFront" },
    { name: "aadhaarBack" },
    { name: "pan" },
    { name: "professionalCert" },
  ]),
  submitStep
);

router.get("/", getPartners);

export default router;
