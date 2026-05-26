import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("Admin Revenue Controller", () => {
  let req, res, Revenue, User, emailService, controller;

  beforeEach(async () => {
    Revenue = { aggregate: sinon.stub(), findOneAndUpdate: sinon.stub() };
    User = { findByIdAndUpdate: sinon.stub() };
    emailService = { sendReminder: sinon.stub().resolves() };
    controller = await esmock(
      "../../controllers/admin/adminRevenueController.js",
      {
        "../../models/revenueModel.js": { default: Revenue },
        "../../models/userModel.js": { default: User },
        "../../models/parkingLocationModel.js": { default: {} },
        "../../services/emailService.js": emailService,
      },
    );
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("sendReminderEmail", () => {
    it("should return 200 on successful email", async () => {
      req.body = {
        vendorEmail: "v@b.com",
        vendorName: "V",
        expiryDate: new Date().toISOString(),
        status: "Expiring Soon",
        vendorId: "vid",
      };
      Revenue.findOneAndUpdate.resolves({});
      await controller.sendReminderEmail(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Sent!");
      expect(emailService.sendReminder.calledOnce).to.be.true;
    });

    it("should return 500 on failure", async () => {
      req.body = {
        vendorEmail: "v@b.com",
        vendorName: "V",
        expiryDate: new Date().toISOString(),
        status: "Overdue",
        vendorId: "vid",
      };
      emailService.sendReminder.rejects(new Error("email failed"));
      await controller.sendReminderEmail(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getRevenue", () => {
    it("should return 200 with vendor revenue data", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      Revenue.aggregate.resolves([
        {
          vendorId: "vid",
          amount: "150000",
          vendorName: "V",
          vendorEmail: "v@b.com",
          hasPaidSubscription: true,
          paymentDate: new Date(),
          expiryDate: futureDate,
        },
      ]);
      await controller.getRevenue(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property(
        "totalRevenueAllVendors",
      );
      expect(res.json.firstCall.args[0]).to.have.property("vendorData");
    });

    it("should mark overdue vendors and update hasPaidSubscription", async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      Revenue.aggregate.resolves([
        {
          vendorId: "vid",
          amount: "150000",
          vendorName: "V",
          vendorEmail: "v@b.com",
          hasPaidSubscription: true,
          paymentDate: new Date(Date.now() - 86400000 * 400),
          expiryDate: pastDate,
        },
      ]);
      User.findByIdAndUpdate.resolves({});
      await controller.getRevenue(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(User.findByIdAndUpdate.calledOnce).to.be.true;
    });

    it("should return 500 on error", async () => {
      Revenue.aggregate.rejects(new Error("err"));
      await controller.getRevenue(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
