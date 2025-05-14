const { Company, Customer } = require('../utils/modelUtil');
const mongoose = require('mongoose');

exports.createCustomer = async (req, res) => {
  try {
    let companyToUpdate;
    if (req.user && req.user.companyId && req.user.role !== 'superadmin') {
      companyToUpdate = await Company.findById(req.user.companyId);
      if (!companyToUpdate) {
        return res
          .status(404)
          .json({ message: 'Associated company not found.' });
      }
      if (!companyToUpdate.status) {
        return res
          .status(403)
          .json({ message: 'Company is not active. Please contact support.' });
      }
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      // Subadmin must have a companyId
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }

    // const company = await Company.findOne(); // This line might need to be re-evaluated or use companyToUpdate
    // if (!company) { // This check is now covered by the one for companyToUpdate if it's the same company
    //   return res.status(404).json({ message: 'Company details not found' });
    // }
    const { name, address, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required.' });
    }

    let customer = await Customer.findOne({
      phone,
      companyId: req.user.companyId
    });
    if (customer) {
      return res.status(400).json({ message: 'Customer already exists.' });
    }

    customer = new Customer({
      name,
      address,
      phone,
      companyId: req.user.companyId
    });
    await customer.save();

    company.totalcustomers += 1; // If this refers to the subadmin's company, use companyToUpdate
    await company.save(); // If this refers to the subadmin's company, use companyToUpdate

    // If you intend to update the specific company of the subadmin:
    if (companyToUpdate) {
      companyToUpdate.totalcustomers += 1;
      await companyToUpdate.save();
    } else {
      // Fallback or error if companyToUpdate is unexpectedly null for a subadmin - though covered by checks
      // Or, if a global company is intended, the original logic for `Company.findOne()` might be kept,
      // but the status check for the subadmin's company still applies.
      // For now, assuming totalcustomers update is for the subadmin's active company.
      const globalCompany = await Company.findOne(); // Original logic, if needed for other purposes
      if (globalCompany && !companyToUpdate) {
        // Example: if superadmin creates customer under a global company
        globalCompany.totalcustomers += 1;
        await globalCompany.save();
      }
    }

    res
      .status(200)
      .json({ message: 'Customer created successfully.', customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res
      .status(500)
      .json({ message: 'Error creating customer', error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
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
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const customers = await Customer.find({ companyId: req.user.companyId });

    res.status(200).json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching customers', error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
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
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Customer ID is required.' });
    }

    const updateData = req.body;
    delete updateData.id;
    delete updateData.companyId;

    const updatedCustomer = await Customer.findOneAndUpdate(
      {
        _id: id,
        companyId: req.user.companyId
      },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      message: 'Customer updated successfully.',
      customer: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating customer details',
      error: error.message
    });
  }
};

exports.getCustomerHistory = async (req, res) => {
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
    } else if (
      req.user &&
      req.user.role === 'subadmin' &&
      !req.user.companyId
    ) {
      return res
        .status(403)
        .json({ message: 'User not associated with a company.' });
    }
    const customers = await Customer.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.user.companyId),
          orders: { $exists: true, $ne: [] }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orders.id',
          foreignField: '_id',
          as: 'orderDetails'
        }
      },
      {
        $unwind: {
          path: '$orderDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          'orderDetails.id': 1,
          'orderDetails.createdat': 1,
          'orderDetails.grandtotal': 1,
          'orderDetails.invoicepdf': 1
        }
      },
      {
        $sort: { 'orderDetails.createdat': -1 }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          address: { $first: '$address' },
          phone: { $first: '$phone' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          orders: { $push: '$orderDetails' }
        }
      }
    ]);

    const formattedCustomers = customers.map((customer) => {
      const latestOrder =
        customer.orders.length > 0 ? customer.orders[0] : null;
      const latestOrderDate = latestOrder ? latestOrder.createdat : null;

      return {
        _id: customer._id,
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
        status: customer.status,
        createdAt: customer.createdAt,
        latestOrderDate,
        orders: customer.orders.map((order) => ({
          id: order.id,
          createdat: order.createdat,
          grandtotal: order.grandtotal,
          invoicepdf: order.invoicepdf
        }))
      };
    });

    const sortedCustomers = formattedCustomers.sort((a, b) => {
      const dateA = a.latestOrderDate ? new Date(a.latestOrderDate) : 0;
      const dateB = b.latestOrderDate ? new Date(b.latestOrderDate) : 0;
      return dateB - dateA;
    });

    res.status(200).json(sortedCustomers);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({
      message: 'Error fetching customer history',
      error: error.message
    });
  }
};
