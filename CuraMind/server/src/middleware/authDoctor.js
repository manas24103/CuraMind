import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

export const authenticateDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id).select("-password");
    
    if (!doctor) {
      return res.status(401).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    req.doctor = doctor;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};
