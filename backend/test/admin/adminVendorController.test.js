import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Admin Vendor Controller", () => {
  let req, res, User, ParkingLocation, controller;

  beforeEach(async () => {
    User = { aggregate: sinon.stub() };
    ParkingLocation = { findOneAndUpdate: sinon.stub() };
    controller = await esmock(
      "../../controllers/admin/adminVendorController.js",
      {
        "../../models/userModel.js": { default: User },
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
      },
    );
    req = { params: {}, body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getVendorManagementDetails", () => {
    it("should return 200 with vendor details", async () => {
      User.aggregate.resolves([
        { vendorId: "vid", name: "V", email: "v@b.com", locationDetails: [] },
      ]);
      await controller.getVendorManagementDetails(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.be.an("array");
    });

    it("should return 500 on error", async () => {
      User.aggregate.rejects(new Error("err"));
      await controller.getVendorManagementDetails(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("updateVendorStatus", () => {
    it("should return 404 if no location found for vendor", async () => {
      req.params = { vendorId: new mongoose.Types.ObjectId().toString() };
      req.body = { status: "APPROVED" };
      ParkingLocation.findOneAndUpdate.resolves(null);
      await controller.updateVendorStatus(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful status update", async () => {
      req.params = { vendorId: new mongoose.Types.ObjectId().toString() };
      req.body = { status: "APPROVED" };
      ParkingLocation.findOneAndUpdate.resolves({
        _id: "locId",
        approvalStatus: "APPROVED",
      });
      await controller.updateVendorStatus(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { vendorId: new mongoose.Types.ObjectId().toString() };
      req.body = { status: "APPROVED" };
      ParkingLocation.findOneAndUpdate.rejects(new Error("err"));
      await controller.updateVendorStatus(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
