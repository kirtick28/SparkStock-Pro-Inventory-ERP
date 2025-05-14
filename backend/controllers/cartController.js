const { Cart, Company } = require('../utils/modelUtil'); // Added Company

exports.saveCart = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    }
    const { id, products, giftboxes, discount, total, gst, grandtotal } =
      req.body;

    const isCartEmpty = products.length === 0 && giftboxes.length === 0;

    let cart = await Cart.findOne({ id, companyId: req.user.companyId });

    if (isCartEmpty) {
      if (cart) {
        await Cart.deleteOne({ id, companyId: req.user.companyId });
        return res
          .status(201)
          .json({ message: 'Cart deleted successfully as it is empty' });
      } else {
        return res
          .status(200)
          .json({ message: 'No action required, cart is already empty' });
      }
    } else {
      if (cart) {
        cart.products = products;
        cart.giftboxes = giftboxes;
        cart.discount = discount;
        cart.total = total;
        cart.gst = gst;
        cart.grandtotal = grandtotal;

        await cart.save();
        return res
          .status(201)
          .json({ message: 'Cart updated successfully', cart });
      } else {
        const newCart = new Cart({
          id,
          companyId: req.user.companyId,
          products,
          giftboxes,
          discount,
          total,
          gst,
          grandtotal
        });

        await newCart.save();
        return res
          .status(201)
          .json({ message: 'Cart saved successfully', cart: newCart });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error saving cart', error: error.message });
  }
};

exports.getPendingCart = async (req, res) => {
  try {
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      const currentCompany = await Company.findById(req.user.companyId);
      if (!currentCompany) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!currentCompany.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    }
    const { id } = req.params;
    const cart = await Cart.findOne({ id, companyId: req.user.companyId });

    if (!cart) {
      return res.status(204).json({ message: 'No pending cart found' });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error retrieving pending cart', error: error.message });
  }
};
