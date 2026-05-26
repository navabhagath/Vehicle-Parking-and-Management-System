import User from '../../models/userModel.js'


export const updateCustomerName = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId; // We get this securely from the verifyToken middleware!

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Update the user and return the new document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true } // This option tells Mongoose to return the UPDATED document, not the old one
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove the password hash before sending to frontend just to be safe
    updatedUser.password_hash = undefined;

    return res.status(200).json({
      success: true,
      message: 'Welcome! Name updated successfully.',
      user: updatedUser // Angular will use this to update the BehaviorSubject
    });
  } catch (error) {
    next(error);
  }
};
