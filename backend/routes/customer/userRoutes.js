import { Router } from "express";
import { getUsersByRole } from "../../controllers/customer/userController.js";

const router = Router();

router.get("/getUserByRole",getUsersByRole )

export default router;