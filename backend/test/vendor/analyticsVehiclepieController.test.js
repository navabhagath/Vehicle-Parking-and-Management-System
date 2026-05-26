import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Analytics Vehicle Pie Controller", () => {
  let req, res, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { exists: sinon.stub() };
    Booking = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/analyticsVehiclepieController.js",
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

  describe("getVehiclePie", () => {
    it("should return 400 for invalid locationId", async () => {
      req.params = { locationId: "bad" };
      req.query = { period: "today" };
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid period", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { period: "invalid" };
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if period is missing", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = {};
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not owned", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { period: "today" };
      ParkingLocation.exists.resolves(null);
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with pie data", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { period: "last7" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([
        { _id: "2-WHEELER", revenue: 500, count: 25 },
        { _id: "4-WHEELER", revenue: 1000, count: 20 },
      ]);
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].twoWheelerRev).to.equal(500);
      expect(res.json.firstCall.args[0].fourWheelerRev).to.equal(1000);
    });

    it("should return 0 when no data", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { period: "last30" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([]);
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].twoWheelerRev).to.equal(0);
      expect(res.json.firstCall.args[0].fourWheelerRev).to.equal(0);
    });

    it("should return 500 on error", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { period: "today" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.rejects(new Error("err"));
      await controller.getVehiclePie(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
