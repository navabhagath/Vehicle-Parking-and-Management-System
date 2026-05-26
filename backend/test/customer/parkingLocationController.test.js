import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Parking Location Controller", () => {
  let req, res, ParkingLocation, controller;

  beforeEach(async () => {
    ParkingLocation = { find: sinon.stub(), findById: sinon.stub() };
    controller = await esmock(
      "../../controllers/customer/parkingLocationController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
      },
    );
    req = { params: {}, query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getAllLocations", () => {
    it("should return 200 with locations", async () => {
      ParkingLocation.find.resolves([
        {
          toObject: () => ({
            _id: new mongoose.Types.ObjectId(),
            vendorId: new mongoose.Types.ObjectId(),
            locationName: "Test",
            isActive: true,
            geo: { type: "Point", coordinates: [80, 13] },
            operationalDays: [],
            operationalHours: { start: "09:00", end: "21:00" },
            capacity: { twoWheeler: 10, fourWheeler: 5 },
            bikePrice: 20,
            carPrice: 50,
            amenities: [],
            documents: {},
            approvalStatus: "APPROVED",
          }),
        },
      ]);
      await controller.getAllLocations(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.be.an("array");
    });

    it("should return 500 on error", async () => {
      ParkingLocation.find.rejects(new Error("DB error"));
      await controller.getAllLocations(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getLocationById", () => {
    it("should return 400 for invalid id", async () => {
      req.params = { id: "invalid" };
      await controller.getLocationById(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findById.resolves(null);
      await controller.getLocationById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with location", async () => {
      const id = new mongoose.Types.ObjectId();
      req.params = { id: id.toString() };
      ParkingLocation.findById.resolves({
        toObject: () => ({
          _id: id,
          vendorId: new mongoose.Types.ObjectId(),
          locationName: "Lot",
          isActive: true,
          geo: { type: "Point", coordinates: [80, 13] },
          operationalDays: [],
          operationalHours: { start: "08:00", end: "22:00" },
          capacity: { twoWheeler: 20, fourWheeler: 10 },
          bikePrice: 15,
          carPrice: 40,
          amenities: [],
          documents: {},
          approvalStatus: "APPROVED",
        }),
      });
      await controller.getLocationById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].locationName).to.equal("Lot");
    });

    it("should return 500 on error", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findById.rejects(new Error("DB error"));
      await controller.getLocationById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
