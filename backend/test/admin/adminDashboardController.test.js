import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

describe("Admin Dashboard Controller", () => {
  let req, res, User, Revenue, controller;

  beforeEach(async () => {
    User = { countDocuments: sinon.stub(), aggregate: sinon.stub() };
    Revenue = { aggregate: sinon.stub() };
    controller = await esmock(
      "../../controllers/admin/adminDashboardController.js",
      {
        "../../models/userModel.js": { default: User },
        "../../models/revenueModel.js": { default: Revenue },
      },
    );
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  describe("getDashboardStats", () => {
    it("should return 200 with dashboard stats", async () => {
      User.countDocuments.resolves(10);
      Revenue.aggregate.resolves([
        { _id: { month: 1, year: 2024 }, monthlyTotal: 5000 },
      ]);
      User.aggregate.resolves([{ _id: { month: 1, year: 2024 }, count: 2 }]);
      await controller.getDashboardStats(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property("totalVendors", 10);
      expect(res.json.firstCall.args[0]).to.have.property("totalRevenue");
      expect(res.json.firstCall.args[0]).to.have.property("monthlyAnalysis");
    });

    it("should return 500 on error", async () => {
      User.countDocuments.rejects(new Error("err"));
      await controller.getDashboardStats(req, res);
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
