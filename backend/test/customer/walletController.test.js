import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Wallet Controller", () => {
  let req, res, Wallet, controller;

  beforeEach(async () => {
    Wallet = { find: sinon.stub(), findByIdAndUpdate: sinon.stub() };
    controller = await esmock(
      "../../controllers/customer/walletController.js",
      {
        "../../models/walletModel.js": { default: Wallet },
      },
    );
    req = { body: {}, query: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getWalletByUser", () => {
    it("should return 400 if userId missing", async () => {
      req.query = {};
      await controller.getWalletByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "userId query param is required",
      );
    });

    it("should return 400 for invalid userId", async () => {
      req.query = { userId: "bad" };
      await controller.getWalletByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid userId");
    });

    it("should return 400 if wallet not found", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Wallet.find.resolves([]);
      await controller.getWalletByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Wallet for User not found",
      );
    });

    it("should return 200 with wallet data", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Wallet.find.resolves([
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(),
          balance: 500,
          toObject: function () {
            return this;
          },
        },
      ]);
      await controller.getWalletByUser(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = { userId: new mongoose.Types.ObjectId().toString() };
      Wallet.find.rejects(new Error("err"));
      await controller.getWalletByUser(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("updateWalletBalance", () => {
    it("should return 400 for invalid walletId", async () => {
      req.params = { walletId: "bad" };
      req.body = { balance: 100 };
      await controller.updateWalletBalance(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if balance not a number", async () => {
      req.params = { walletId: new mongoose.Types.ObjectId().toString() };
      req.body = { balance: "abc" };
      await controller.updateWalletBalance(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if wallet not found", async () => {
      req.params = { walletId: new mongoose.Types.ObjectId().toString() };
      req.body = { balance: 100 };
      Wallet.findByIdAndUpdate.resolves(null);
      await controller.updateWalletBalance(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on success", async () => {
      const wid = new mongoose.Types.ObjectId();
      req.params = { walletId: wid.toString() };
      req.body = { balance: 200 };
      Wallet.findByIdAndUpdate.resolves({
        _id: wid,
        userId: new mongoose.Types.ObjectId(),
        balance: 200,
      });
      await controller.updateWalletBalance(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.params = { walletId: new mongoose.Types.ObjectId().toString() };
      req.body = { balance: 100 };
      Wallet.findByIdAndUpdate.rejects(new Error("err"));
      await controller.updateWalletBalance(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
