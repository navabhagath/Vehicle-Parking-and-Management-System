import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("Auth Controller", () => {
  let req, res, next;
  let User, Wallet, Revenue, Otp, bcryptMock, jwtMock;
  let authController;

  beforeEach(async () => {
    User = {
      findOne: sinon.stub(),
      create: sinon.stub(),
    };
    Wallet = { create: sinon.stub() };
    Revenue = { create: sinon.stub() };
    Otp = { findOne: sinon.stub(), deleteOne: sinon.stub() };
    bcryptMock = {
      hash: sinon.stub(),
      compare: sinon.stub(),
      genSalt: sinon.stub(),
    };
    jwtMock = { sign: sinon.stub(), verify: sinon.stub() };

    authController = await esmock("../../controllers/auth/authController.js", {
      "../../models/userModel.js": { default: User },
      "../../models/walletModel.js": { default: Wallet },
      "../../models/revenueModel.js": { default: Revenue },
      "../../models/otpModel.js": { default: Otp },
      bcrypt: bcryptMock,
      jsonwebtoken: jwtMock,
    });

    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  // ═══════════ vendorRegistration ═══════════
  describe("vendorRegistration", () => {
    it("should return 400 if required fields are missing", async () => {
      req.body = { name: "Test" };
      await authController.vendorRegistration(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "Name,email,phone,password are required",
      );
    });

    it("should return 400 if password < 8 characters", async () => {
      req.body = {
        name: "T",
        email: "a@b.com",
        phone: "9876543210",
        password: "short",
      };
      await authController.vendorRegistration(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "Password must be alteast 8 characters long",
      );
    });

    it("should return 409 if email already exists", async () => {
      req.body = {
        name: "T",
        email: "existing@b.com",
        phone: "9876543210",
        password: "Password1",
      };
      User.findOne.resolves({
        email: "existing@b.com",
        phone: "+919999999999",
      });
      await authController.vendorRegistration(req, res, next);
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "email already exists",
      );
    });

    it("should return 409 if phone already exists", async () => {
      req.body = {
        name: "T",
        email: "new@b.com",
        phone: "9876543210",
        password: "Password1",
      };
      User.findOne.resolves({ email: "other@b.com", phone: "+919876543210" });
      await authController.vendorRegistration(req, res, next);
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "Phone already exists",
      );
    });

    it("should return 201 on successful registration", async () => {
      req.body = {
        name: "Vendor",
        email: "v@b.com",
        phone: "9876543210",
        password: "Password1",
      };
      User.findOne.resolves(null);
      User.create.resolves({
        _id: "vid",
        name: "Vendor",
        email: "v@b.com",
        role: "VENDOR",
      });
      Wallet.create.resolves({ userId: "vid", balance: 0 });
      Revenue.create.resolves({ vendorId: "vid", amount: 150000 });
      await authController.vendorRegistration(req, res, next);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
    });

    it("should call next on unexpected error", async () => {
      req.body = {
        name: "T",
        email: "e@b.com",
        phone: "9876543210",
        password: "Password1",
      };
      User.findOne.rejects(new Error("DB error"));
      await authController.vendorRegistration(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  // ═══════════ vendorLogin ═══════════
  describe("vendorLogin", () => {
    it("should return 400 if email or password missing", async () => {
      req.body = { email: "a@b.com" };
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "Email and password required",
      );
    });

    it("should return 400 if user not found", async () => {
      req.body = { email: "a@b.com", password: "Pass1234" };
      User.findOne.returns({ select: sinon.stub().resolves(null) });
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal(
        "Invalid credentials",
      );
    });

    it("should return 400 if password doesn't match", async () => {
      req.body = { email: "a@b.com", password: "Wrong123" };
      const mockUser = {
        _id: { toString: () => "uid" },
        email: "a@b.com",
        role: "VENDOR",
        password_hash: "hash",
        permissions: [],
      };
      User.findOne.returns({ select: sinon.stub().resolves(mockUser) });
      bcryptMock.compare.resolves(false);
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 403 if account is SUSPENDED", async () => {
      req.body = { email: "a@b.com", password: "Pass1234" };
      const mockUser = {
        _id: { toString: () => "uid" },
        email: "a@b.com",
        role: "VENDOR",
        password_hash: "hash",
        permissions: [],
        accountStatus: "SUSPENDED",
      };
      User.findOne.returns({ select: sinon.stub().resolves(mockUser) });
      bcryptMock.compare.resolves(true);
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal("ACCOUNT_SUSPENDED");
    });

    it("should return 403 if account is QUIT", async () => {
      req.body = { email: "a@b.com", password: "Pass1234" };
      const mockUser = {
        _id: { toString: () => "uid" },
        email: "a@b.com",
        role: "VENDOR",
        password_hash: "hash",
        permissions: [],
        accountStatus: "QUIT",
      };
      User.findOne.returns({ select: sinon.stub().resolves(mockUser) });
      bcryptMock.compare.resolves(true);
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal("ACCOUNT_CLOSED");
    });

    it("should return 200 with token on success", async () => {
      req.body = { email: "a@b.com", password: "Pass1234" };
      const mockUser = {
        _id: { toString: () => "uid" },
        email: "a@b.com",
        role: "VENDOR",
        password_hash: "hash",
        permissions: ["create_location"],
        accountStatus: "ACTIVE",
      };
      User.findOne.returns({ select: sinon.stub().resolves(mockUser) });
      bcryptMock.compare.resolves(true);
      jwtMock.sign.returns("fake-token");
      await authController.vendorLogin(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.token).to.equal("fake-token");
    });
  });

  // ═══════════ adminLogin ═══════════
  describe("adminLogin", () => {
    it("should return 400 if email or password missing", async () => {
      req.body = { password: "Pass1234" };
      await authController.adminLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 on successful admin login", async () => {
      req.body = { email: "admin@b.com", password: "Admin123" };
      const mockUser = {
        _id: { toString: () => "aid" },
        email: "admin@b.com",
        role: "SUPER_ADMIN",
        password_hash: "hash",
        permissions: [],
        accountStatus: "ACTIVE",
      };
      User.findOne.returns({ select: sinon.stub().resolves(mockUser) });
      bcryptMock.compare.resolves(true);
      jwtMock.sign.returns("admin-token");
      await authController.adminLogin(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].success).to.be.true;
    });
  });

  // ═══════════ customerVerifyAndLogin ═══════════
  describe("customerVerifyAndLogin", () => {
    it("should return 400 if phone or otp missing", async () => {
      req.body = { phone: "9876543210" };
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Phone and OTP are required",
      );
    });

    it("should return 400 if OTP invalid/expired", async () => {
      req.body = { phone: "9876543210", otp: "1234" };
      Otp.findOne.resolves(null);
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Invalid or expired OTP",
      );
    });

    it("should create new user if customer doesn't exist", async () => {
      req.body = { phone: "9876543210", otp: "1234" };
      Otp.findOne.resolves({ _id: "otpId" });
      Otp.deleteOne.resolves();
      User.findOne.resolves(null);
      const newUser = {
        _id: { toString: () => "cid" },
        phone: "+919876543210",
        role: "CUSTOMER",
        permissions: [],
      };
      User.create.resolves(newUser);
      Wallet.create.resolves({});
      jwtMock.sign.returns("cust-token");
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.isNewUser).to.be.true;
    });

    it("should return 403 if customer is SUSPENDED", async () => {
      req.body = { phone: "9876543210", otp: "1234" };
      Otp.findOne.resolves({ _id: "otpId" });
      Otp.deleteOne.resolves();
      User.findOne.resolves({
        _id: { toString: () => "cid" },
        role: "CUSTOMER",
        accountStatus: "SUSPENDED",
        permissions: [],
      });
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal("ACCOUNT_SUSPENDED");
    });

    it("should return 403 if customer account is QUIT", async () => {
      req.body = { phone: "9876543210", otp: "1234" };
      Otp.findOne.resolves({ _id: "otpId" });
      Otp.deleteOne.resolves();
      User.findOne.resolves({
        _id: { toString: () => "cid" },
        role: "CUSTOMER",
        accountStatus: "QUIT",
        permissions: [],
      });
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal("ACCOUNT_CLOSED");
    });

    it("should return 200 for existing active customer", async () => {
      req.body = { phone: "9876543210", otp: "1234" };
      Otp.findOne.resolves({ _id: "otpId" });
      Otp.deleteOne.resolves();
      User.findOne.resolves({
        _id: { toString: () => "cid" },
        role: "CUSTOMER",
        accountStatus: "ACTIVE",
        permissions: [],
      });
      jwtMock.sign.returns("cust-token");
      await authController.customerVerifyAndLogin(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].data.isNewUser).to.be.false;
    });
  });

  // ═══════════ verifyPasswordResetOtp ═══════════
  describe("verifyPasswordResetOtp", () => {
    it("should return 400 if fields missing", async () => {
      req.body = { email: "a@b.com" };
      await authController.verifyPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if role is invalid", async () => {
      req.body = { email: "a@b.com", otp: "1234", role: "CUSTOMER" };
      await authController.verifyPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 if OTP is invalid", async () => {
      req.body = { email: "a@b.com", otp: "1234", role: "VENDOR" };
      Otp.findOne.resolves(null);
      await authController.verifyPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 with resetToken on valid OTP", async () => {
      req.body = { email: "a@b.com", otp: "1234", role: "VENDOR" };
      Otp.findOne.resolves({ _id: "otpId" });
      Otp.deleteOne.resolves();
      jwtMock.sign.returns("reset-token");
      await authController.verifyPasswordResetOtp(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].resetToken).to.equal("reset-token");
    });
  });

  // ═══════════ resetUserPassword ═══════════
  describe("resetUserPassword", () => {
    it("should return 400 if fields missing", async () => {
      req.body = { resetToken: "token" };
      await authController.resetUserPassword(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 401 if token is expired/invalid", async () => {
      req.body = { resetToken: "bad-token", newPassword: "NewPass1" };
      jwtMock.verify.throws(new Error("jwt expired"));
      await authController.resetUserPassword(req, res, next);
      expect(res.status.calledWith(401)).to.be.true;
    });

    it("should return 403 if token purpose is not PASSWORD_RESET", async () => {
      req.body = { resetToken: "token", newPassword: "NewPass1" };
      jwtMock.verify.returns({
        email: "a@b.com",
        role: "VENDOR",
        purpose: "OTHER",
      });
      await authController.resetUserPassword(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      req.body = { resetToken: "token", newPassword: "NewPass1" };
      jwtMock.verify.returns({
        email: "a@b.com",
        role: "VENDOR",
        purpose: "PASSWORD_RESET",
      });
      User.findOne.resolves(null);
      await authController.resetUserPassword(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 on successful password reset", async () => {
      req.body = { resetToken: "token", newPassword: "NewPass1" };
      jwtMock.verify.returns({
        email: "a@b.com",
        role: "VENDOR",
        purpose: "PASSWORD_RESET",
      });
      const mockUser = { password_hash: "old", save: sinon.stub().resolves() };
      User.findOne.resolves(mockUser);
      bcryptMock.genSalt.resolves("salt");
      bcryptMock.hash.resolves("newhash");
      await authController.resetUserPassword(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal(
        "Password reset successfully. You can now login.",
      );
    });
  });
});
