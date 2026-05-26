import Router from 'express';
import { updateCustomerName } from '../../controllers/auth/userController.js';
import {
  listUsers,
  getUserById,
  updateUser,
  getMe,
} from '../../controllers/admin/adminUserController.js';
import { verifyToken, requireRole } from '../../middlewares/authMiddleware.js';

const router = Router();

// Available to any authenticated user — used by the frontend to refresh
// the cached user state (including permissions) on app load.
router.get('/me', verifyToken, getMe);

// Customer renames themselves after first-time login.
router.put('/update-name', verifyToken, updateCustomerName);

// Super-admin user management.
router.get('/', verifyToken, requireRole('SUPER_ADMIN'), listUsers);
router.get('/:id', verifyToken, requireRole('SUPER_ADMIN'), getUserById);
router.patch('/:id', verifyToken, requireRole('SUPER_ADMIN'), updateUser);

export default router;