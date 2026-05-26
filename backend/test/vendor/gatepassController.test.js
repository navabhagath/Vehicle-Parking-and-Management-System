import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Gatepass Controller", () => {
  let req, res, ParkingLocation, Booking, Wallet, Transaction, controller;

  beforeEach(async () => {
    ParkingLocation = { findOne: sinon.stub() };
    Booking = { findOne: sinon.stub() };
    Wallet = { findOne: sinon.stub() };
    Transaction = { create: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/gatepassController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
        "../../models/bookingModel.js": { default: Booking },
        "../../models/walletModel.js": { default: Wallet },
        "../../models/transactionModel.js": { default: Transaction },
      },
    );
    req = {
      params: {},
      body: {},
      user: { userId: new mongoose.Types.ObjectId().toString() },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getBookingById", () => {
    it("should return 400 for invalid bookingId", async () => {
      req.params = {
        bookingId: "bad",
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not found", async () => {
      req.params = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 404 if booking not found", async () => {
      req.params = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon.stub().resolves({ _id: "locId" }),
      });
      Booking.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with booking data", async () => {
      const bid = new mongoose.Types.ObjectId();
      req.params = {
        bookingId: bid.toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon.stub().resolves({ _id: new mongoose.Types.ObjectId() }),
      });
      Booking.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            toObject: () => ({
              _id: bid,
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
              status: "CONFIRMED",
              qrData: "qr",
            }),
          }),
      });
      await controller.getBookingById(req, res);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("checkIn", () => {
    it("should return 400 for invalid bookingId", async () => {
      req.params = {
        bookingId: "bad",
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      await controller.checkIn(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not found", async () => {
      req.params = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.checkIn(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 400 if booking status is not CONFIRMED", async () => {
      req.params = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon.stub().resolves({ _id: new mongoose.Types.ObjectId() }),
      });
      Booking.findOne.returns({
        exec: sinon
          .stub()
          .resolves({ status: "COMPLETED", save: sinon.stub() }),
      });
      await controller.checkIn(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 on successful check-in", async () => {
      const bid = new mongoose.Types.ObjectId();
      req.params = {
        bookingId: bid.toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon.stub().resolves({ _id: new mongoose.Types.ObjectId() }),
      });
      const booking = {
        status: "CONFIRMED",
        actualCheckIn: null,
        save: sinon.stub().resolves(),
        toObject: () => ({
          _id: bid,
          customerId: new mongoose.Types.ObjectId(),
          vehicleId: new mongoose.Types.ObjectId(),
          locationId: new mongoose.Types.ObjectId(),
          customerName: "J",
          plateNumber: "TN",
          type: "4-WHEELER",
          scheduledStartTime: new Date(),
          scheduledEndTime: new Date(),
          actualCheckIn: new Date(),
          actualCheckOut: null,
          finalDeductedAmount: 0,
          status: "ACTIVE",
          qrData: "qr",
        }),
      };
      Booking.findOne.returns({ exec: sinon.stub().resolves(booking) });
      await controller.checkIn(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(booking.status).to.equal("ACTIVE");
    });
  });

  describe("checkOut", () => {
    it("should return 400 if bookingId or locationId missing", async () => {
      req.body = { bookingId: "abc" };
      await controller.checkOut(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid ObjectIds", async () => {
      req.body = { bookingId: "bad", locationId: "bad" };
      await controller.checkOut(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if location not found", async () => {
      req.body = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.checkOut(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 404 if booking not found", async () => {
      req.body = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            _id: new mongoose.Types.ObjectId(),
            vendorId: req.user.userId,
            carPrice: 50,
            bikePrice: 20,
          }),
      });
      Booking.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.checkOut(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 400 if booking not ACTIVE", async () => {
      req.body = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            _id: new mongoose.Types.ObjectId(),
            vendorId: req.user.userId,
            carPrice: 50,
            bikePrice: 20,
          }),
      });
      Booking.findOne.returns({
        exec: sinon.stub().resolves({ status: "COMPLETED" }),
      });
      await controller.checkOut(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if no check-in time", async () => {
      req.body = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            _id: new mongoose.Types.ObjectId(),
            vendorId: req.user.userId,
            carPrice: 50,
            bikePrice: 20,
          }),
      });
      Booking.findOne.returns({
        exec: sinon.stub().resolves({ status: "ACTIVE", actualCheckIn: null }),
      });
      await controller.checkOut(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 404 if customer wallet not found", async () => {
      req.body = {
        bookingId: new mongoose.Types.ObjectId().toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      ParkingLocation.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            _id: new mongoose.Types.ObjectId(),
            vendorId: new mongoose.Types.ObjectId(),
            carPrice: 50,
            bikePrice: 20,
          }),
      });
      Booking.findOne.returns({
        exec: sinon
          .stub()
          .resolves({
            status: "ACTIVE",
            actualCheckIn: new Date(Date.now() - 7200000),
            type: "4-WHEELER",
            customerId: new mongoose.Types.ObjectId(),
            save: sinon.stub().resolves(),
            toObject: () => ({}),
          }),
      });
      Wallet.findOne.returns({ exec: sinon.stub().resolves(null) });
      await controller.checkOut(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful checkout", async () => {
      const bid = new mongoose.Types.ObjectId();
      req.body = {
        bookingId: bid.toString(),
        locationId: new mongoose.Types.ObjectId().toString(),
      };
      const location = {
        _id: new mongoose.Types.ObjectId(),
        vendorId: new mongoose.Types.ObjectId(),
        carPrice: 50,
        bikePrice: 20,
      };
      ParkingLocation.findOne.returns({
        exec: sinon.stub().resolves(location),
      });
      const booking = {
        _id: bid,
        status: "ACTIVE",
        actualCheckIn: new Date(Date.now() - 3600000),
        type: "4-WHEELER",
        customerId: new mongoose.Types.ObjectId(),
        finalDeductedAmount: 0,
        actualCheckOut: null,
        save: sinon.stub().resolves(),
        toObject: () => ({
          _id: bid,
          customerId: new mongoose.Types.ObjectId(),
          vehicleId: new mongoose.Types.ObjectId(),
          locationId: new mongoose.Types.ObjectId(),
          customerName: "J",
          plateNumber: "TN",
          type: "4-WHEELER",
          scheduledStartTime: new Date(),
          scheduledEndTime: new Date(),
          actualCheckIn: new Date(),
          actualCheckOut: new Date(),
          finalDeductedAmount: 50,
          status: "COMPLETED",
          qrData: "qr",
        }),
      };
      Booking.findOne.returns({ exec: sinon.stub().resolves(booking) });
      const custWallet = {
        _id: new mongoose.Types.ObjectId(),
        userId: booking.customerId,
        balance: 1000,
        save: sinon.stub().resolves(),
      };
      const vendWallet = {
        _id: new mongoose.Types.ObjectId(),
        userId: location.vendorId,
        balance: 500,
        save: sinon.stub().resolves(),
      };
      Wallet.findOne.returns({
        exec: sinon
          .stub()
          .onFirstCall()
          .resolves(custWallet)
          .onSecondCall()
          .resolves(vendWallet),
      });
      Transaction.create.resolves({});
      await controller.checkOut(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Checkout successful",
      );
    });
  });
});
