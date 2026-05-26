import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Subscription Controller", () => {
  let req, res, next, Revenue, User, controller;

  beforeEach(async () => {
    Revenue = { findOne: sinon.stub() };
    User = { updateOne: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/vendorSubscriptionController.js",
      {
        "../../models/revenueModel.js": { default: Revenue },
        "../../models/userModel.js": { default: User },
      },
    );
    req = { user: { userId: new mongoose.Types.ObjectId().toString() } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  describe("getSubscriptionStatus", () => {
    it("should return expired if no revenue record", async () => {
      Revenue.findOne.returns({
        lean: sinon.stub().returns({ exec: sinon.stub().resolves(null) }),
      });
      User.updateOne.returns({ exec: sinon.stub().resolves() });
      await controller.getSubscriptionStatus(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.isExpired).to.be.true;
      expect(res.json.firstCall.args[0].data.daysLeft).to.equal(0);
    });

    it("should return active subscription status", async () => {
      const creditedOn = new Date();
      Revenue.findOne.returns({
        lean: sinon
          .stub()
          .returns({
            exec: sinon.stub().resolves({ credited_on: creditedOn }),
          }),
      });
      await controller.getSubscriptionStatus(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.isExpired).to.be.false;
      expect(res.json.firstCall.args[0].data.daysLeft).to.be.greaterThan(0);
    });

    it("should mark expired and update user", async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2); // 2 years ago = expired
      Revenue.findOne.returns({
        lean: sinon
          .stub()
          .returns({ exec: sinon.stub().resolves({ credited_on: oldDate }) }),
      });
      User.updateOne.returns({ exec: sinon.stub().resolves() });
      await controller.getSubscriptionStatus(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.isExpired).to.be.true;
    });

    it("should call next on error", async () => {
      Revenue.findOne.returns({
        lean: sinon
          .stub()
          .returns({ exec: sinon.stub().rejects(new Error("err")) }),
      });
      await controller.getSubscriptionStatus(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  describe("renewSubscription", () => {
    it("should return 404 if no revenue record", async () => {
      Revenue.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.renewSubscription(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful renewal (expired)", async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);
      const revenue = {
        credited_on: oldDate,
        amount: 150000,
        save: sinon.stub().resolves(),
      };
      Revenue.findOne.returns({ exec: sinon.stub().resolves(revenue) });
      User.updateOne.returns({ exec: sinon.stub().resolves() });
      await controller.renewSubscription(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Subscription renewed successfully",
      );
    });

    it("should return 200 on successful renewal (not expired)", async () => {
      const recentDate = new Date();
      const revenue = {
        credited_on: recentDate,
        amount: 150000,
        save: sinon.stub().resolves(),
      };
      Revenue.findOne.returns({ exec: sinon.stub().resolves(revenue) });
      User.updateOne.returns({ exec: sinon.stub().resolves() });
      await controller.renewSubscription(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should call next on error", async () => {
      Revenue.findOne.returns({ exec: sinon.stub().rejects(new Error("err")) });
      await controller.renewSubscription(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
});
