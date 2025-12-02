const express = require('express');
const { body } = require('express-validator');
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('salary')
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom(value => value >= 0)
    .withMessage('Salary cannot be negative')
];

router.use(auth);

// Routes
router.post('/', employeeValidation, createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.put('/:id', employeeValidation, updateEmployee);
router.delete('/:id', roleCheck('admin'), deleteEmployee);

module.exports = router;