const { validationResult } = require('express-validator');
const Employee = require('../models/Employee');

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, designation, salary } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const employee = await Employee.create({
      name,
      email,
      phone,
      designation,
      salary,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating employee',
      error: error.message
    });
  }
};

// @route   GET /api/employees
// @desc    Get all employees with pagination and search
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const employees = await Employee.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
      error: error.message
    });
  }
};

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get Employee Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee',
      error: error.message
    });
  }
};

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, designation, salary } = req.body;

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, designation, salary },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update Employee Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating employee',
      error: error.message
    });
  }
};

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin only)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting employee',
      error: error.message
    });
  }
};