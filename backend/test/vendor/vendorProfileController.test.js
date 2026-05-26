import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Profile Controller", () => {
  let req, res, User, controller;

  beforeEach(async () => {
    User = { findById: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/vendorProfileController.js",
      {
        "../../models/userModel.js": { default: User },
      },
    );
    req = { user: { userId: new mongoose.Types.ObjectId().toString() } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
  });

  describe("getVendorData", () => {
    it("should return 404 if vendor not found", async () => {
      User.findById.resolves(null);
      await controller.getVendorData(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Vendor Not Found");
    });

    it("should return 200 with vendor data", async () => {
      User.findById.resolves({ _id: "vid", name: "Vendor", email: "v@b.com" });
      await controller.getVendorData(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });
});
