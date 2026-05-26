import mongoose from "mongoose";
import Wallet from "../../models/walletModel.js";

const formatWallet = (wallet) => {
  if (!wallet) return null;
  return {
    id: wallet._id.toString(),
    userId: wallet.userId.toString(),
    balance: wallet.balance,
  };
};

export const updateWalletBalance = async (req, res) => {
  try {
    const { walletId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ message: "Invalid walletId" });
    }

    const { balance } = req.body;

    if (balance === undefined || typeof balance !== "number") {
      return res.status(400).json({ message: "balance (number) is required" });
    }

    const updated = await Wallet.findByIdAndUpdate(
      walletId,
      { balance },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    return res.status(200).json(formatWallet(updated));
  } catch (err) {
    console.error("updateWalletBalance error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWalletByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    // console.log(userId);

    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId query param is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const wallets = await Wallet.find({ userId });

    if (wallets.length == 0) {
      return res.status(400).json({ message: "Wallet for User not found" });
    }

    return res.status(200).json(wallets.map(formatWallet));
  } catch (err) {
    console.error("getWalletByUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
