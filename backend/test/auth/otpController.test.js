import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("OTP Controller", () => {
  let req, res, next;
  let User, Otp, smsService, emailService;
  let otpController;

  beforeEach(async () => {
    User = { findOne: sinon.stub() };
    Otp = {
      deleteMany: sinon.stub().resolves(),
      create: sinon.stub().resolves({}),
    };
    smsService = { sendOtpSms: sinon.stub().resolves() };
    emailService = { sendOtpEmail: sinon.stub().resolves() };

    otpController = await esmock("../../controllers/auth/otpController.js", {
      "../../models/userModel.js": { default: User },
      "../../models/otpModel.js": { default: Otp },
      "../../services/smsService.js": smsService,
      "../../services/emailService.js": emailService,
      "otp-generator": { default: { generate: () => "1234" } },
    });

    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  // ═══════════ customerRequestOtp ═══════════
  describe("customerRequestOtp", () => {
    it("should return 400 if phone is missing", async () => {
      req.body = {};
      await otpController.customerRequestOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Invalid phone number",
      );
    });

    it("should return 400 if phone format is invalid", async () => {
      req.body = { phone: "12345" };
      await otpController.customerRequestOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for phone starting with invalid digit", async () => {
      req.body = { phone: "1234567890" };
      await otpController.customerRequestOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 for valid 10-digit phone", async () => {
      req.body = { phone: "9876543210" };
      await otpController.customerRequestOtp(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
      expect(Otp.deleteMany.calledOnce).to.be.true;
      expect(Otp.create.calledOnce).to.be.true;
    });

    it("should return 200 for +91 prefixed phone", async () => {
      req.body = { phone: "+919876543210" };
      await otpController.customerRequestOtp(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should include devCode in non-production", async () => {
      req.body = { phone: "9876543210" };
      await otpController.customerRequestOtp(req, res, next);
      expect(res.json.firstCall.args[0].devCode).to.equal("1234");
    });

    it("should call next if SMS fails in production", async () => {
      smsService.sendOtpSms.rejects(new Error("SMS failed"));

      // Re-mock with NODE_ENV=production
      const prodController = await esmock(
        "../../controllers/auth/otpController.js",
        {
          "../../models/userModel.js": { default: User },
          "../../models/otpModel.js": { default: Otp },
          "../../services/smsService.js": smsService,
          "../../services/emailService.js": emailService,
          "otp-generator": { default: { generate: () => "1234" } },
        },
      );

      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      req.body = { phone: "9876543210" };
      await prodController.customerRequestOtp(req, res, next);
      process.env.NODE_ENV = origEnv;
      expect(next.calledOnce).to.be.true;
    });
  });

  // ═══════════ requestPasswordResetOtp ═══════════
  describe("requestPasswordResetOtp", () => {
    it("should return 400 if email is missing", async () => {
      req.body = { role: "VENDOR" };
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Email and role are required",
      );
    });

    it("should return 400 if role is missing", async () => {
      req.body = { email: "a@b.com" };
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid role", async () => {
      req.body = { email: "a@b.com", role: "CUSTOMER" };
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal("Invalid role");
    });

    it("should return 404 if user not found", async () => {
      req.body = { email: "notfound@b.com", role: "VENDOR" };
      User.findOne.resolves(null);
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on success for VENDOR", async () => {
      req.body = { email: "vendor@b.com", role: "VENDOR" };
      User.findOne.resolves({ email: "vendor@b.com" });
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
      expect(emailService.sendOtpEmail.calledOnce).to.be.true;
    });

    it("should return 200 on success for SUPER_ADMIN", async () => {
      req.body = { email: "admin@b.com", role: "SUPER_ADMIN" };
      User.findOne.resolves({ email: "admin@b.com" });
      await otpController.requestPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });
});
