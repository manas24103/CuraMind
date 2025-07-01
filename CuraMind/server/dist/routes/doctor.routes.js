"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = require("../controllers/doctor.controller");
const router = express_1.default.Router();
const doctorController = new doctor_controller_1.DoctorController();
// Routes for doctors
router.get('/', async (req, res) => {
    await doctorController.getAllDoctors(req, res);
});
router.get('/:id', async (req, res) => {
    await doctorController.getDoctorById(req, res);
});
router.post('/', async (req, res) => {
    await doctorController.createDoctor(req, res);
});
router.put('/:id', async (req, res) => {
    await doctorController.updateDoctor(req, res);
});
router.delete('/:id', async (req, res) => {
    await doctorController.deleteDoctor(req, res);
});
exports.default = router;
