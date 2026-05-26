import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Ticket Controller", () => {
  let req, res, Ticket, controller;

  beforeEach(async () => {
    Ticket = {
      find: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
      create: sinon.stub(),
    };
    controller = await esmock(
      "../../controllers/customer/ticketController.js",
      {
        "../../models/ticketModel.js": { default: Ticket },
      },
    );
    req = { body: {}, query: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getTicketsByUser", () => {
    it("should return 400 if creatorId missing", async () => {
      req.query = {};
      await controller.getTicketsByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid creatorId", async () => {
      req.query = { creatorId: "bad" };
      await controller.getTicketsByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with tickets", async () => {
      req.query = { creatorId: new mongoose.Types.ObjectId().toString() };
      Ticket.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getTicketsByUser(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("getTicketsByHandler", () => {
    it("should return 400 if handlerId missing", async () => {
      req.query = {};
      await controller.getTicketsByHandler(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid handlerId", async () => {
      req.query = { handlerId: "bad" };
      await controller.getTicketsByHandler(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with tickets", async () => {
      req.query = { handlerId: new mongoose.Types.ObjectId().toString() };
      Ticket.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getTicketsByHandler(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("updateTicketStatus", () => {
    it("should return 400 for invalid ticketId", async () => {
      req.params = { ticketId: "bad" };
      req.body = { status: "CLOSED" };
      await controller.updateTicketStatus(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if status missing", async () => {
      req.params = { ticketId: new mongoose.Types.ObjectId().toString() };
      req.body = {};
      await controller.updateTicketStatus(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if ticket not found", async () => {
      req.params = { ticketId: new mongoose.Types.ObjectId().toString() };
      req.body = { status: "CLOSED" };
      Ticket.findByIdAndUpdate.resolves(null);
      await controller.updateTicketStatus(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on success", async () => {
      const tid = new mongoose.Types.ObjectId();
      req.params = { ticketId: tid.toString() };
      req.body = { status: "CLOSED" };
      Ticket.findByIdAndUpdate.resolves({
        toObject: () => ({
          _id: tid,
          creatorId: new mongoose.Types.ObjectId(),
          handlerId: null,
          bookingId: null,
          subject: "Test",
          description: "Desc",
          category: "GENERAL",
          status: "CLOSED",
          createdAt: new Date(),
          emailId: "a@b.com",
        }),
      });
      await controller.updateTicketStatus(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("createTicket", () => {
    it("should return 400 if required fields missing", async () => {
      req.body = { creatorId: new mongoose.Types.ObjectId().toString() };
      await controller.createTicket(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid creatorId", async () => {
      req.body = {
        creatorId: "bad",
        subject: "T",
        description: "D",
        category: "G",
        emailId: "a@b.com",
      };
      await controller.createTicket(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid creatorId");
    });

    it("should return 400 for invalid handlerId", async () => {
      req.body = {
        creatorId: new mongoose.Types.ObjectId().toString(),
        handlerId: "bad",
        subject: "T",
        description: "D",
        category: "G",
        emailId: "a@b.com",
      };
      await controller.createTicket(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid handlerId");
    });

    it("should return 201 on success", async () => {
      req.body = {
        creatorId: new mongoose.Types.ObjectId().toString(),
        subject: "Issue",
        description: "Desc",
        category: "BOOKING",
        emailId: "a@b.com",
      };
      Ticket.create.resolves({
        toObject: () => ({
          _id: new mongoose.Types.ObjectId(),
          creatorId: new mongoose.Types.ObjectId(),
          handlerId: null,
          bookingId: null,
          subject: "Issue",
          description: "Desc",
          category: "BOOKING",
          status: "OPEN",
          createdAt: new Date(),
          emailId: "a@b.com",
        }),
      });
      await controller.createTicket(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.body = {
        creatorId: new mongoose.Types.ObjectId().toString(),
        subject: "T",
        description: "D",
        category: "G",
        emailId: "a@b.com",
      };
      Ticket.create.rejects(new Error("err"));
      await controller.createTicket(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
