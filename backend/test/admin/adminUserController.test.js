import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import esmock from "esmock";

describe("Admin User Controller", () => {
  let req, res, next, User, emailService, controller;

  beforeEach(async () => {
    User = {
      find: sinon.stub(),
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
    };
    emailService = {
      sendSuspensionEmail: sinon.stub().resolves(),
      sendReactivationEmail: sinon.stub().resolves(),
    };
    controller = await esmock(
      "../../controllers/admin/adminUserController.js",
      {
        "../../models/userModel.js": { default: User },
        "../../services/emailService.js": emailService,
      },
    );
    req = { params: {}, body: {}, user: { userId: "adminId" } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  describe("listUsers", () => {
    it("should return 200 with users", async () => {
      User.find.returns({ sort: sinon.stub().resolves([]) });
      await controller.listUsers(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should call next on error", async () => {
      User.find.returns({ sort: sinon.stub().rejects(new Error("err")) });
      await controller.listUsers(req, res, next);
      expect(next.calledOnce).to.be.true;
    });
  });

  describe("getUserById", () => {
    it("should return 404 if user not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      User.findById.resolves(null);
      await controller.getUserById(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with user", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      User.findById.resolves({ _id: "uid", name: "Test" });
      await controller.getUserById(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should return 404 on CastError", async () => {
      req.params = { id: "bad" };
      const err = new Error("cast");
      err.name = "CastError";
      User.findById.rejects(err);
      await controller.getUserById(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe("updateUser", () => {
    it("should return 404 if target user not found", async () => {
      req.params = { id: new mongoose.Types.ObjectId().toString() };
      req.body = { permissions: ["create_location"] };
      User.findById.resolves(null);
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 403 if trying to modify self", async () => {
      req.params = { id: "adminId" };
      req.body = { permissions: ["create_location"] };
      User.findById.resolves({
        _id: { toString: () => "adminId" },
        role: "VENDOR",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal("CANNOT_MODIFY_SELF");
    });

    it("should return 403 if target is SUPER_ADMIN", async () => {
      req.params = { id: "otherId" };
      req.body = { permissions: ["create_location"] };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "SUPER_ADMIN",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.firstCall.args[0].code).to.equal(
        "CANNOT_MODIFY_SUPER_ADMIN",
      );
    });

    it("should return 400 if no editable fields", async () => {
      req.params = { id: "otherId" };
      req.body = { name: "test" }; // not in ADMIN_EDITABLE_FIELDS
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid permissions", async () => {
      req.params = { id: "otherId" };
      req.body = { permissions: ["invalid_perm"] };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 400 for invalid accountStatus", async () => {
      req.params = { id: "otherId" };
      req.body = { accountStatus: "INVALID" };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 200 on successful update", async () => {
      req.params = { id: "otherId" };
      req.body = { permissions: ["create_location", "view_analytics"] };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
        accountStatus: "ACTIVE",
      });
      User.findByIdAndUpdate.resolves({
        _id: "otherId",
        permissions: ["create_location", "view_analytics"],
        accountStatus: "ACTIVE",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should send suspension email when status changes to SUSPENDED", async () => {
      req.params = { id: "otherId" };
      req.body = { accountStatus: "SUSPENDED" };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
        accountStatus: "ACTIVE",
      });
      User.findByIdAndUpdate.resolves({
        _id: "otherId",
        accountStatus: "SUSPENDED",
        email: "v@b.com",
        name: "V",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("should send reactivation email when status changes from SUSPENDED to ACTIVE", async () => {
      req.params = { id: "otherId" };
      req.body = { accountStatus: "ACTIVE" };
      User.findById.resolves({
        _id: { toString: () => "otherId" },
        role: "VENDOR",
        accountStatus: "SUSPENDED",
      });
      User.findByIdAndUpdate.resolves({
        _id: "otherId",
        accountStatus: "ACTIVE",
        email: "v@b.com",
        name: "V",
      });
      await controller.updateUser(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });

  describe("getMe", () => {
    it("should return 404 if user not found", async () => {
      User.findById.resolves(null);
      await controller.getMe(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it("should return 200 with user data", async () => {
      User.findById.resolves({ _id: "adminId", name: "Admin" });
      await controller.getMe(req, res, next);
      expect(res.status.calledWith(200)).to.be.true;
    });
  });
});
