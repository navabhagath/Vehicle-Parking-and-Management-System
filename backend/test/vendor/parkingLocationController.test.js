import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Parking Location Controller", () => {
  let req, res, ParkingLocation, controller;

  beforeEach(async () => {
    ParkingLocation = {
      findOne: sinon.stub(),
      find: sinon.stub(),
      create: sinon.stub(),
    };
    controller = await esmock(
      "../../controllers/vendor/parkingLocationController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
      },
    );
    req = {
      body: {},
      query: {},
      params: {},
      user: { userId: new mongoose.Types.ObjectId().toString() },
      file: null,
      protocol: "http",
      get: sinon.stub().returns("localhost:4000"),
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("uploadGstDocument", () => {
    it("should return 400 if no file uploaded", async () => {
      req.file = null;
      await controller.uploadGstDocument(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("No file uploaded");
    });

    it("should return 200 with file URL", async () => {
      req.file = { filename: "gst-123.pdf" };
      await controller.uploadGstDocument(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("url");
      expect(res.json.firstCall.args[0].filename).to.equal("gst-123.pdf");
    });
  });

  describe("createLocation", () => {
    it("should return 409 if location name already exists", async () => {
      req.body = {
        locationName: "Existing",
        geo: {},
        operationalDays: [],
        operationalHours: {},
        capacity: {},
        bikePrice: 20,
        carPrice: 50,
      };
      ParkingLocation.findOne.resolves({ locationName: "Existing" });
      await controller.createLocation(req, res);
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "You already have a location with this name",
      );
    });

    it("should return 201 on successful creation", async () => {
      req.body = {
        locationName: "New Location",
        geo: { lat: 13, lng: 80 },
        operationalDays: ["Mon"],
        operationalHours: { open: "09:00", close: "21:00" },
        capacity: { twoWheeler: 50, fourWheeler: 30 },
        bikePrice: 20,
        carPrice: 50,
        amenities: ["CCTV"],
        documents: {},
      };
      ParkingLocation.findOne.resolves(null);
      ParkingLocation.create.resolves({ _id: "locId", ...req.body });
      await controller.createLocation(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Location created successfully",
      );
    });

    it("should return 500 on error", async () => {
      req.body = { locationName: "Test" };
      ParkingLocation.findOne.rejects(new Error("err"));
      await controller.createLocation(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("checkLocationName", () => {
    it("should return 200 with matches", async () => {
      req.query = { locationName: "Test" };
      ParkingLocation.find.resolves([]);
      await controller.checkLocationName(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { locationName: "Test" };
      ParkingLocation.find.rejects(new Error("err"));
      await controller.checkLocationName(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getParkingLocationsById", () => {
    it("should return 400 for invalid id", async () => {
      req.params = { id: "bad" };
      await controller.getParkingLocationsById(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findOne.resolves(null);
      await controller.getParkingLocationsById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with location", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findOne.resolves({ _id: "locId", locationName: "Test" });
      await controller.getParkingLocationsById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      ParkingLocation.findOne.rejects(new Error("err"));
      await controller.getParkingLocationsById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
