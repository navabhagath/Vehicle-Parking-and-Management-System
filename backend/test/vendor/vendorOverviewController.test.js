import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Overview Controller", () => {
  let req, res, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { findOne: sinon.stub() };
    Booking = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/vendorOverviewController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
        "../../models/bookingModel.js": { default: Booking },
      },
    );
    req = {
      params: {},
      user: { userId: new mongoose.Types.ObjectId().toString() },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getOverviewData", () => {
    it("should return 400 for invalid locationId", async () => {
      req.params = { locationId: "bad" };
      await controller.getOverviewData(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not found", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findOne.resolves(null);
      await controller.getOverviewData(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with overview data", async () => {
      const locId = new mongoose.Types.ObjectId();
      req.params = { locationId: locId.toString() };
      ParkingLocation.findOne.resolves({
        _id: locId,
        capacity: { twoWheeler: 20, fourWheeler: 10 },
      });
      Booking.aggregate.resolves([
        { occupied: [{ count: 5 }], recentParking: [] },
      ]);
      await controller.getOverviewData(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("slotSummary");
    });

    it("should return 500 on error", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findOne.rejects(new Error("err"));
      await controller.getOverviewData(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
