import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Vendor Dashboard Controller", () => {
  let req, res, next, ParkingLocation, Booking, controller;

  beforeEach(async () => {
    ParkingLocation = { find: sinon.stub() };
    Booking = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/vendor/vendorDashboardController.js",
      {
        "../../models/parkingLocationModel.js": { default: ParkingLocation },
        "../../models/bookingModel.js": { default: Booking },
      },
    );
    req = { user: { userId: new mongoose.Types.ObjectId().toString() } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  describe("getVendorDashboard", () => {
    it("should return 200 with empty data when no locations", async () => {
      ParkingLocation.find.returns({
        lean: sinon.stub().returns({ exec: sinon.stub().resolves([]) }),
      });
      await controller.getVendorDashboard(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.locations).to.deep.equal([]);
    });

    it("should return 200 with dashboard data", async () => {
      const locId = new mongoose.Types.ObjectId();
      const locations = [
        {
          _id: locId,
          isActive: true,
          approvalStatus: "APPROVED",
          capacity: { twoWheeler: 20, fourWheeler: 10 },
        },
      ];
      ParkingLocation.find.returns({
        lean: sinon.stub().returns({ exec: sinon.stub().resolves(locations) }),
      });
      Booking.aggregate.returns({
        exec: sinon.stub().resolves([{ _id: locId, count: 5 }]),
      });
      await controller.getVendorDashboard(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.activeCount).to.equal(1);
      expect(res.json.firstCall.args[0].data.totalSlots).to.equal(30);
      expect(res.json.firstCall.args[0].data.totalOccupied).to.equal(5);
    });

    it("should call next on error", async () => {
      ParkingLocation.find.returns({
        lean: sinon
          .stub()
          .returns({ exec: sinon.stub().rejects(new Error("err")) }),
      });
      await controller.getVendorDashboard(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });
});
