import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Analytics Revenue Controller", () => {
  let req, res, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { exists: sinon.stub() };
    Booking = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/analyticsRevenueController.js",
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

  describe("getRevenueBar", () => {
    it("should return 400 for invalid locationId", async () => {
      req.params = { locationId: "bad" };
      req.query = { range: "week" };
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid range", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "invalid" };
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if range is missing", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = {};
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not owned", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "week" };
      ParkingLocation.exists.resolves(null);
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with weekly data", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "week" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([]);
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("labels");
      expect(res.json.firstCall.args[0]).to.have.property("data");
      expect(res.json.firstCall.args[0].labels).to.have.length(7);
    });

    it("should return 200 with monthly data", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "month" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([]);
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].labels).to.have.length(12);
    });

    it("should return 200 with yearly data", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "year" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.resolves([]);
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].labels).to.have.length(3);
    });

    it("should return 500 on error", async () => {
      req.params = { locationId: new mongoose.Types.ObjectId().toString() };
      req.query = { range: "week" };
      ParkingLocation.exists.resolves({ _id: "locId" });
      Booking.aggregate.rejects(new Error("err"));
      await controller.getRevenueBar(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
