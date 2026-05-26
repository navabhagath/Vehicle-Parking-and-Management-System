import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Transaction Controller", () => {
  let req, res, Transaction, controller;

  beforeEach(async () => {
    Transaction = { create: sinon.stub(), find: sinon.stub() };
    controller = await esmock(
      "../../controllers/customer/transactionController.js",
      {
        "../../models/transactionModel.js": { default: Transaction },
      },
    );
    req = { body: {}, query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("createTransaction", () => {
    it("should return 400 if walletId missing", async () => {
      req.body = { type: "RECHARGE", amount: 100, status: "SUCCESS" };
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid walletId", async () => {
      req.body = {
        walletId: "bad",
        type: "RECHARGE",
        amount: 100,
        status: "SUCCESS",
      };
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid type", async () => {
      req.body = {
        walletId: new mongoose.Types.ObjectId().toString(),
        type: "INVALID",
        amount: 100,
        status: "SUCCESS",
      };
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid status", async () => {
      req.body = {
        walletId: new mongoose.Types.ObjectId().toString(),
        type: "RECHARGE",
        amount: 100,
        status: "PENDING",
      };
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 201 on success", async () => {
      req.body = {
        walletId: new mongoose.Types.ObjectId().toString(),
        type: "RECHARGE",
        amount: 100,
        status: "SUCCESS",
      };
      Transaction.create.resolves({
        toObject: () => ({
          _id: new mongoose.Types.ObjectId(),
          walletId: new mongoose.Types.ObjectId(),
          bookingId: null,
          type: "RECHARGE",
          amount: 100,
          status: "SUCCESS",
          createdAt: new Date(),
        }),
      });
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.body = {
        walletId: new mongoose.Types.ObjectId().toString(),
        type: "RECHARGE",
        amount: 100,
        status: "SUCCESS",
      };
      Transaction.create.rejects(new Error("err"));
      await controller.createTransaction(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getTransactions", () => {
    it("should return 400 if walletId missing", async () => {
      req.query = {};
      await controller.getTransactions(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid walletId", async () => {
      req.query = { walletId: "bad" };
      await controller.getTransactions(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with transactions", async () => {
      req.query = { walletId: new mongoose.Types.ObjectId().toString() };
      Transaction.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getTransactions(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 200 with paginated transactions", async () => {
      req.query = {
        walletId: new mongoose.Types.ObjectId().toString(),
        _page: "1",
        _limit: "5",
      };
      const limitStub = sinon.stub().resolves([]);
      const skipStub = sinon.stub().returns({ limit: limitStub });
      const sortStub = sinon.stub().returns({ skip: skipStub });
      Transaction.find.returns({ sort: sortStub });
      await controller.getTransactions(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });
});
