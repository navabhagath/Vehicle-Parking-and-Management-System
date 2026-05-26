import express from 'express';
import vendorDashboardRoutes from './vendorDashboardRoutes.js'
import parkingLocationRoutes from './parkingLocationRoutes.js'
import overviewRoutes from './vendorOverviewRoutes.js'
import profileDataRoutes from './profileDataRoutes.js'
import vendorBookingRoutes from './vendorBookingRoutes.js'
import vendorAnalyticsRoutes from './vendorAnalyticsRoutes.js'
import vendorSubscriptionRoutes from './vendorSubscriptionRoutes.js'
import gatePassRoutes from '../booking/gatepassRoutes.js'
const router = express.Router();
 
router.use('/',vendorDashboardRoutes);
router.use('/parkinglocations', parkingLocationRoutes);
router.use('/locations', overviewRoutes);
router.use('/profileData', profileDataRoutes);
router.use('/bookings', vendorBookingRoutes);
router.use('/analytics',vendorAnalyticsRoutes);
router.use('/subscription',vendorSubscriptionRoutes);
router.use('/gatepass',gatePassRoutes);


export default router;