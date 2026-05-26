import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Booking Controller", () => {
  let req, res, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { exists: sinon.stub() };
    Booking = { find: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/vendorBookingController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
        "../../models/bookingModel.js": { default: Booking },
      },
    );
    req = {
      params: {},
      query: {},
      user: { userId: new mongoose.Types.ObjectId().toString() },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getBookings", () => {
    it("should return 400 for invalid locationId", async () => {
      req.params = { locationId: "bad" };
      await controller.getBookings(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not owned by vendor", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.exists.resolves(null);
      await controller.getBookings(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with current bookings", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { type: "current" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getBookings(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 200 with overstayed bookings", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { type: "overstayed" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getBookings(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { type: "current" };
      ParkingLocation.exists.rejects(new Error("err"));
      await controller.getBookings(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
