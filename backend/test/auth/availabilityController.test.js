import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("Availability Controller", () => {
  let req, res, next;
  let User, controller;

  beforeEach(async () => {
    User = { exists: sinon.stub() };
    controller = await esmock(
      "../../controllers/auth/availabilityController.js",
      {
        "../../models/userModel.js": { default: User },
      },
    );

    req = { query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  // ═══════════ checkEmailAvailability ═══════════
  describe("checkEmailAvailability", () => {
    it("should return 400 if email is empty", async () => {
      req.query = { email: "" };
      await controller.checkEmailAvailability(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.false;
    });

    it("should return 400 if email is not provided", async () => {
      req.query = {};
      await controller.checkEmailAvailability(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return available: true if email does not exist", async () => {
      req.query = { email: "new@b.com" };
      User.exists.resolves(null);
      await controller.checkEmailAvailability(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.true;
    });

    it("should return available: false if email exists", async () => {
      req.query = { email: "existing@b.com" };
      User.exists.resolves({ _id: "id" });
      await controller.checkEmailAvailability(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.false;
    });

    it("should call next on error", async () => {
      req.query = { email: "a@b.com" };
      User.exists.rejects(new Error("DB error"));
      await controller.checkEmailAvailability(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  // ═══════════ checkPhoneAvailability ═══════════
  describe("checkPhoneAvailability", () => {
    it("should return 400 if phone is empty", async () => {
      req.query = { phone: "" };
      await controller.checkPhoneAvailability(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.false;
    });

    it("should return available: true if phone not found", async () => {
      req.query = { phone: "9876543210" };
      User.exists.resolves(null);
      await controller.checkPhoneAvailability(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.true;
    });

    it("should return available: false if phone exists", async () => {
      req.query = { phone: "9876543210" };
      User.exists.resolves({ _id: "id" });
      await controller.checkPhoneAvailability(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.false;
    });

    it("should handle +91 prefixed phone", async () => {
      req.query = { phone: "+919876543210" };
      User.exists.resolves(null);
      await controller.checkPhoneAvailability(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].available).to.be.true;
    });

    it("should call next on error", async () => {
      req.query = { phone: "9876543210" };
      User.exists.rejects(new Error("DB error"));
      await controller.checkPhoneAvailability(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
});
