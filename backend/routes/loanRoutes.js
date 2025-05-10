const express = require('express');
const router = express.Router();

const loanController = require('../controllers/loanController');
const { verifyToken } = require('../middleware/authMiddleware');
router.post('/apply', verifyToken, loanController.createLoan);
router.get('/my', verifyToken, loanController.getMyLoans);
router.put('/:id/approve', verifyToken, loanController.approveLoan);
router.put('/:id/reject', verifyToken, loanController.rejectLoan);
router.delete('/:id', verifyToken, loanController.deleteLoan);

module.exports = router;
