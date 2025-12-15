import User from "../models/User.js";

/* ADD */
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();

  res.json(user.addresses);
};

/* GET */
export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.addresses);
};

/* SET DEFAULT */
export const setDefaultAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === req.params.id;
  });

  await user.save();
  res.json(user.addresses);
};

/* DELETE */
export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter(
    a => a._id.toString() !== req.params.id
  );

  if (!user.addresses.some(a => a.isDefault) && user.addresses.length) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
};
