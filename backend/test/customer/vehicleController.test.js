import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Vehicle Controller", () => {
  let req, res, Vehicle, controller;

  beforeEach(async () => {
    Vehicle = {
      find: sinon.stub(),
      findOne: sinon.stub(),
      create: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
      findByIdAndDelete: sinon.stub(),
    };
    controller = await esmock(
      "../../controllers/customer/vehicleController.js",
      {
        "../../models/vehicleModel.js": { default: Vehicle },
        "../../middlewares/idMiddleware.js": {
          updateId: (arr) =>
            arr ? arr.map(({ _id, ...rest }) => ({ id: _id, ...rest })) : null,
        },
      },
    );
    req = { body: {}, query: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
  });

  describe("getVehicleController", () => {
    it("should return 400 if userId missing", async () => {
      req.query = {};
      await controller.getVehicleController(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if userId invalid", async () => {
      req.query = { userId: "bad" };
      await controller.getVehicleController(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if no vehicles found", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Vehicle.find.returns({ lean: sinon.stub().resolves([]) });
      await controller.getVehicleController(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with vehicles", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Vehicle.find.returns({
        lean: sinon.stub().resolves([{ _id: "v1", name: "Bike" }]),
      });
      await controller.getVehicleController(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Vehicle.find.returns({ lean: sinon.stub().rejects(new Error("err")) });
      await controller.getVehicleController(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getVehicleById", () => {
    it("should return 400 for invalid vehicleId", async () => {
      req.params = { vehicleId: "bad" };
      await controller.getVehicleById(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if vehicle not found", async () => {
      req.params = { vehicleId: new mongoose.Types.ObjectId().toString() };
      Vehicle.findOne.resolves(null);
      await controller.getVehicleById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with vehicle", async () => {
      req.params = { vehicleId: new mongoose.Types.ObjectId().toString() };
      Vehicle.findOne.resolves({ _id: "v1", plateNumber: "TN09" });
      await controller.getVehicleById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("addVehicle", () => {
    it("should return 400 if required fields missing", async () => {
      req.body = { userId: "abc" };
      await controller.addVehicle(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 201 on success", async () => {
      req.body = {
        userId: new mongoose.Types.ObjectId().toString(),
        plateNumber: "TN09AB1234",
        model: "Honda",
        name: "My Bike",
      };
      Vehicle.create.resolves({
        toObject: () => ({
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          name: "My Bike",
          plateNumber: "TN09AB1234",
          model: "Honda",
          type: "2-WHEELER",
          isPrimary: false,
        }),
      });
      await controller.addVehicle(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.body = { userId: "uid", plateNumber: "TN", model: "H", name: "B" };
      Vehicle.create.rejects(new Error("err"));
      await controller.addVehicle(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("updateVehicle", () => {
    it("should return 400 if no update data", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = {};
      await controller.updateVehicle(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if vehicle not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { name: "Updated" };
      Vehicle.findByIdAndUpdate.resolves(null);
      await controller.updateVehicle(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on success", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { name: "Updated" };
      Vehicle.findByIdAndUpdate.resolves({ _id: "v1", name: "Updated" });
      await controller.updateVehicle(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("deleteVehicle", () => {
    it("should return 404 if vehicle not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      Vehicle.findByIdAndDelete.resolves(null);
      await controller.deleteVehicle(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on success", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      Vehicle.findByIdAndDelete.resolves({ _id: "v1" });
      await controller.deleteVehicle(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      Vehicle.findByIdAndDelete.rejects(new Error("err"));
      await controller.deleteVehicle(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
