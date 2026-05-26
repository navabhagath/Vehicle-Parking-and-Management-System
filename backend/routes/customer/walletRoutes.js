import { Router } from "express";
import {
  getWalletByUser,
  updateWalletBalance,
} from "../../controllers/customer/walletController.js";

const router = Router();

router.get("/", getWalletByUser);
router.patch("/:walletId", updateWalletBalance);

export default router;
