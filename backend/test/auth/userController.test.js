import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("Auth User Controller", () => {
  let req, res, next;
  let User, controller;

  beforeEach(async () => {
    User = { findByIdAndUpdate: sinon.stub() };
    controller = await esmock("../../controllers/auth/userController.js", {
      "../../models/userModel.js": { default: User },
    });

    req = { body: {}, user: { userId: "userId123" } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  describe("updateCustomerName", () => {
    it("should return 400 if name is missing", async () => {
      req.body = {};
      await controller.updateCustomerName(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Name is required");
    });

    it("should return 400 if name is only whitespace", async () => {
      req.body = { name: "   " };
      await controller.updateCustomerName(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      req.body = { name: "New Name" };
      User.findByIdAndUpdate.resolves(null);
      await controller.updateCustomerName(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful update", async () => {
      req.body = { name: "Updated Name" };
      User.findByIdAndUpdate.resolves({
        _id: "userId123",
        name: "Updated Name",
      });
      await controller.updateCustomerName(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Welcome! Name updated successfully.",
      );
    });

    it("should call next on error", async () => {
      req.body = { name: "Test" };
      User.findByIdAndUpdate.rejects(new Error("DB error"));
      await controller.updateCustomerName(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
});
