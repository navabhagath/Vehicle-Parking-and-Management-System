import { Router } from "express";
import { getWalletByUser } from "../../controllers/customer/walletController.js";

const router = Router();

router.get("/getWalletById", getWalletByUser);

export default router;
