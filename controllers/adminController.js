import Employee from "../models/Employee.js";
import Booking from "../models/Booking.js";

// Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { fullName, email, phone, address, city, state, postalCode, specialization, shift, salary } = req.body;

    if (!fullName || !email) return res.status(400).json({ error: "Name & Email required" });

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ error: "Employee exists" });

    const employee = new Employee({ fullName, email, phone, address, city, state, postalCode, specialization, shift, salary });
    await employee.save();
    res.status(201).json({ message: "Employee created", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("services.serviceId", "name price")
      .populate("assignedTo", "fullName email phone");
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (status) booking.status = status;
    if (assignedTo) booking.assignedTo = assignedTo;

    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("services.serviceId", "name price")
      .populate("assignedTo", "fullName email phone");

    res.json({ message: "Booking updated", booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
