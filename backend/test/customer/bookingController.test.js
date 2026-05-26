import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Customer Booking Controller", () => {
  let req, res, Booking, Vehicle, ParkingLocation, controller;

  beforeEach(async () => {
    Booking = {
      findById: sinon.stub(),
      find: sinon.stub(),
      create: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
    };
    Vehicle = { find: sinon.stub() };
    ParkingLocation = { find: sinon.stub() };

    controller = await esmock(
      "../../controllers/customer/bookingController.js",
      {
        "../../models/bookingModel.js": { default: Booking },
        "../../models/vehicleModel.js": { default: Vehicle },
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
      },
    );

    req = { body: {}, query: {}, params: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      set: sinon.stub(),
      removeHeader: sinon.stub(),
    };
  });

  // ═══════════ getBookingById ═══════════
  describe("getBookingById", () => {
    it("should return 400 for invalid id", async () => {
      req.params = { id: "invalid" };
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid booking id");
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      Booking.findById.resolves(null);
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with formatted booking", async () => {
      const id = new mongoose.Types.ObjectId();
      req.params = { id: id.toString() };
      Booking.findById.resolves({
        toObject: () => ({
          _id: id,
          customerId: new mongoose.Types.ObjectId(),
          vehicleId: new mongoose.Types.ObjectId(),
          locationId: new mongoose.Types.ObjectId(),
          customerName: "John",
          plateNumber: "TN09AB1234",
          type: "4-WHEELER",
          scheduledStartTime: new Date(),
          scheduledEndTime: new Date(),
          actualCheckIn: null,
          actualCheckOut: null,
          finalDeductedAmount: 0,
          status: "ACTIVE",
          qrData: "qr123",
        }),
      });
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("id");
    });

    it("should return 500 on error", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      Booking.findById.rejects(new Error("DB error"));
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ═══════════ getBookings ═══════════
  describe("getBookings", () => {
    it("should return 400 if customerId missing", async () => {
      req.query = {};
      await controller.getBookings(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid customerId", async () => {
      req.query = { customerId: "invalid" };
      await controller.getBookings(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with bookings array", async () => {
      const cid = new mongoose.Types.ObjectId().toString();
      req.query = { customerId: cid };
      const execStub = sinon.stub().resolves([]);
      const limitStub = sinon.stub().returns({ exec: execStub });
      const skipStub = sinon.stub().returns({ limit: limitStub });
      const sortStub = sinon.stub().returns({ skip: skipStub, exec: execStub });
      Booking.find.returns({ sort: sortStub });
      await controller.getBookings(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.be.an("array");
    });
  });

  // ═══════════ getActiveBooking ═══════════
  describe("getActiveBooking", () => {
    it("should return 400 if customerId missing", async () => {
      req.query = {};
      await controller.getActiveBooking(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid customerId", async () => {
      req.query = { customerId: "bad" };
      await controller.getActiveBooking(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with active bookings", async () => {
      req.query = { customerId: new mongoose.Types.ObjectId().toString() };
      Booking.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.getActiveBooking(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  // ═══════════ getBookingsByStatus ═══════════
  describe("getBookingsByStatus", () => {
    it("should return 200 with filtered bookings", async () => {
      req.query = { customerId: "cid", status: "COMPLETED" };
      Booking.find.resolves([]);
      await controller.getBookingsByStatus(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 200 with all bookings when no filter", async () => {
      req.query = {};
      Booking.find.resolves([]);
      await controller.getBookingsByStatus(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 500 on error", async () => {
      req.query = {};
      Booking.find.rejects(new Error("DB error"));
      await controller.getBookingsByStatus(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ═══════════ createBooking ═══════════
  describe("createBooking", () => {
    it("should return 400 if required fields missing", async () => {
      req.body = { customerId: "abc" };
      await controller.createBooking(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid ObjectId", async () => {
      req.body = {
        customerId: "invalid",
        vehicleId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
        customerName: "John",
        plateNumber: "TN09",
        type: "4-WHEELER",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date().toISOString(),
        qrData: "qr",
      };
      await controller.createBooking(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid customerId");
    });

    it("should return 201 on successful creation", async () => {
      const ids = {
        customerId: new mongoose.Types.ObjectId().toString(),
        vehicleId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      req.body = {
        ...ids,
        customerName: "John",
        plateNumber: "TN09AB1234",
        type: "4-WHEELER",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date().toISOString(),
        qrData: "unique-qr",
      };
      Booking.create.resolves({
        toObject: () => ({
          _id: new mongoose.Types.ObjectId(),
          ...req.body,
          status: "CONFIRMED",
          actualCheckIn: null,
          actualCheckOut: null,
          finalDeductedAmount: 0,
        }),
      });
      await controller.createBooking(req, res);
      expect(res.status.calledWith(201)).to.be.true;
    });

    it("should return 409 for duplicate qrData", async () => {
      const ids = {
        customerId: new mongoose.Types.ObjectId().toString(),
        vehicleId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      req.body = {
        ...ids,
        customerName: "J",
        plateNumber: "TN",
        type: "4-WHEELER",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date().toISOString(),
        qrData: "dup",
      };
      Booking.create.rejects({ code: 11000, keyValue: { qrData: "dup" } });
      await controller.createBooking(req, res);
      expect(res.status.calledWith(409)).to.be.true;
    });

    it("should return 500 on error", async () => {
      const ids = {
        customerId: new mongoose.Types.ObjectId().toString(),
        vehicleId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      req.body = {
        ...ids,
        customerName: "J",
        plateNumber: "TN",
        type: "4-WHEELER",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date().toISOString(),
        qrData: "qr",
      };
      Booking.create.rejects(new Error("DB error"));
      await controller.createBooking(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // ═══════════ updateBooking ═══════════
  describe("updateBooking", () => {
    it("should return 400 for invalid id", async () => {
      req.params = { id: "invalid" };
      req.body = { status: "CANCELLED" };
      await controller.updateBooking(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { status: "CANCELLED" };
      Booking.findByIdAndUpdate.resolves(null);
      await controller.updateBooking(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful update", async () => {
      const id = new mongoose.Types.ObjectId();
      req.params = { id: id.toString() };
      req.body = { status: "CANCELLED" };
      Booking.findByIdAndUpdate.resolves({
        toObject: () => ({
          _id: id,
          customerId: new mongoose.Types.ObjectId(),
          vehicleId: new mongoose.Types.ObjectId(),
          locationId: new mongoose.Types.ObjectId(),
          customerName: "John",
          plateNumber: "TN09",
          type: "4-WHEELER",
          scheduledStartTime: new Date(),
          scheduledEndTime: new Date(),
          actualCheckIn: null,
          actualCheckOut: null,
          finalDeductedAmount: 0,
          status: "CANCELLED",
          qrData: "qr",
        }),
      });
      await controller.updateBooking(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  // ═══════════ getBookingsByUser ═══════════
  describe("getBookingsByUser", () => {
    it("should return 400 if customerId missing", async () => {
      req.query = {};
      await controller.getBookingsByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid customerId", async () => {
      req.query = { customerId: "bad" };
      await controller.getBookingsByUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if no bookings found", async () => {
      req.query = { customerId: new mongoose.Types.ObjectId().toString() };
      const limitStub = sinon.stub().resolves([]);
      const skipStub = sinon.stub().returns({ limit: limitStub });
      const sortStub = sinon.stub().returns({ skip: skipStub });
      Booking.find.returns({ sort: sortStub });
      await controller.getBookingsByUser(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // ═══════════ getRecentBookings ═══════════
  describe("getRecentBookings", () => {
    it("should return 400 if customerId missing", async () => {
      req.query = {};
      await controller.getRecentBookings(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid customerId", async () => {
      req.query = { customerId: "bad" };
      await controller.getRecentBookings(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with empty array when no bookings", async () => {
      req.query = { customerId: new mongoose.Types.ObjectId().toString() };
      const limitStub = sinon.stub().resolves([]);
      const skipStub = sinon.stub().returns({ limit: limitStub });
      const sortStub = sinon.stub().returns({ skip: skipStub });
      Booking.find.returns({ sort: sortStub });
      await controller.getRecentBookings(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal([]);
    });
  });
});
