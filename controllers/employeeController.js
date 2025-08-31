import Employee from "../models/Employee.js";

// GET all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({ employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE employee
export const createEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, address, city, state, postalCode, specialization, shift, salary } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Full Name and Email are required" });
    }

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ error: "Employee already exists" });

    const employee = new Employee({
      fullName, email, phone, address, city, state, postalCode, specialization, shift, salary
    });

    await employee.save();
    res.status(201).json({ message: "Employee created", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json({ message: "Employee updated", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    res.status(200).json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
