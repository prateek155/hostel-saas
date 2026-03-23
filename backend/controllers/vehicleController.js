import vehicleModel from "../models/vehicleModel.js";

/* ===============================
   OWNER → VEHICLE DASHBOARD
================================ */
export const getVehiclesController = async (req, res) => {
  try {
    if (!req.user.vehicleAccess) {
      return res.status(403).json({
        success: false,
        message: "Vehicle access not enabled",
      });
    }

    const vehicles = await vehicleModel.find({
      ownerId: req.user.userId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error("GET VEHICLES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
    });
  }
};

/* ===============================
   OWNER → ADD VEHICLE
================================ */
export const addVehicleController = async (req, res) => {
  try {
    if (!req.user.vehicleAccess) {
      return res.status(403).json({
        success: false,
        message: "Vehicle access not enabled",
      });
    }

    const { studentName, vehicleType, vehicleNumber, slotNumber } = req.body;

    if (!studentName || !vehicleType || !vehicleNumber || !slotNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const vehicle = await vehicleModel.create({
      ownerId: req.user.userId,
      hostelId: req.user.hostelId,
      studentName,
      vehicleType,
      vehicleNumber,
      slotNumber,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    console.error("ADD VEHICLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add vehicle",
    });
  }
};
