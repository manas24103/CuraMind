"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const patient_routes_1 = __importDefault(require("./routes/patient.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
doctor_routes_1.default;
patient_routes_1.default;
appointment_routes_1.default;
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/doctors', doctor_routes_1.default);
app.use('/api/patients', patient_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
// MongoDB Connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/doctor-dashboard')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
