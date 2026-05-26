import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Analytics Stats Controller", () => {
  let req, res, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { exists: sinon.stub() };
    Booking = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/analyticsStatsController.js",
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

  describe("getRevenueStats", () => {
    it("should return 400 for invalid locationId", async () => {
      req.params = { locationId: "bad" };
      await controller.getRevenueStats(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not owned", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.exists.resolves(null);
      await controller.getRevenueStats(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with revenue stats", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([
        {
          today: [{ total: 500 }],
          month: [{ total: 5000 }],
          year: [{ total: 50000 }],
          total: [{ total: 100000 }],
        },
      ]);
      await controller.getRevenueStats(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].today).to.equal(500);
      expect(res.json.firstCall.args[0].month).to.equal(5000);
      expect(res.json.firstCall.args[0].year).to.equal(50000);
      expect(res.json.firstCall.args[0].total).to.equal(100000);
    });

    it("should return 0 for empty facets", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([{}]);
      await controller.getRevenueStats(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].today).to.equal(0);
    });

    it("should return 500 on error", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.rejects(new Error("err"));
      await controller.getRevenueStats(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
