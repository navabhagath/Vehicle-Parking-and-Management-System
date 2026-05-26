import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer User Controller", () => {
  let req, res, User, controller;

  beforeEach(async () => {
    User = { find: sinon.stub() };
    controller = await esmock("../../controllers/customer/userController.js", {
      "../../models/userModel.js": { default: User },
    });
    req = { query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getUsersByRole", () => {
    it("should return 400 for invalid role", async () => {
      req.query = { role: "INVALID" };
      await controller.getUsersByRole(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with users for valid role", async () => {
      req.query = { role: "VENDOR" };
      User.find.returns({
        lean: sinon
          .stub()
          .resolves([
            {
              _id: new mongoose.Types.ObjectId(),
              name: "V",
              role: "VENDOR",
              email: "v@b.com",
              phone: "+91",
              accountStatus: "ACTIVE",
              isVerified: true,
              hasPaidSubscription: true,
              permissions: [],
            },
          ]),
      });
      await controller.getUsersByRole(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 200 with all users when no role", async () => {
      req.query = {};
      User.find.returns({ lean: sinon.stub().resolves([]) });
      await controller.getUsersByRole(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { role: "VENDOR" };
      User.find.returns({ lean: sinon.stub().rejects(new Error("err")) });
      await controller.getUsersByRole(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
