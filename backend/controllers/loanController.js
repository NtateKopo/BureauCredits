const Loan = require('../models/Loan');
const User = require('../models/User');

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const borrowerId = req.user.id;

    const loan = await Loan.create({ amount, reason, borrowerId, status: 'pending' });
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Error creating loan', error: err.message });
  }
};

// Get all loans (for lenders)
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('borrowerId', 'fullName')
      .lean();

    const result = loans.map(loan => ({
      ...loan,
      borrowerName: loan.borrowerId?.fullName || 'Unknown',
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching loans', error: err.message });
  }
};

// Get loans of logged-in borrower
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ borrowerId: req.user.id });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your loans' });
  }
};

// Approve a loan
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Error approving loan' });
  }
};

// Reject a loan
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json(loan);
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting loan' });
  }
};

// Delete a loan
exports.deleteLoan = async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Loan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting loan' });
  }
};
