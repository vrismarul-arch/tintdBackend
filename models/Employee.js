    import mongoose from "mongoose";
    import bcrypt from "bcryptjs";

    const employeeSchema = new mongoose.Schema(
      {
        employeeId: { type: String, unique: true, trim: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, default: "Tintd@12345" },
        role: { type: String, enum: ["superadmin", "admin", "employee"], default: "employee" },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        avatar: {
          type: String,
          default:
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        },
        specialization: { type: String },
        shift: { type: String },
        salary: { type: Number },
      },
      { timestamps: true }
    );

    // Pre-save hook to generate employeeId
    employeeSchema.pre("save", async function (next) {
      if (this.isNew) {
        const lastEmployee = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
        let nextId = 1;
        if (lastEmployee && lastEmployee.employeeId) {
          const lastId = parseInt(lastEmployee.employeeId.replace("TindEmp", ""), 10);
          nextId = lastId + 1;
        }
        this.employeeId = `TindEmp${String(nextId).padStart(3, "0")}`;
      }
      next();
    });

    // Pre-save hook to hash password
    employeeSchema.pre("save", async function (next) {
      if (!this.isModified("password")) {
        next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });

    // Method to match password
    employeeSchema.methods.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    export default mongoose.model("Employee", employeeSchema);