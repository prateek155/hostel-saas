import userModel from "../models/userModel.js";
import hostelModel from "../models/hostelModel.js";
import roomModel from "../models/roomModel.js";
import studentModel from "../models/studentModel.js";
import vehicleModel from "../models/vehicleModel.js";
import attandanceModel from "../models/attandanceModel.js";
import fs from "fs";
import feeModel from "../models/feeModel.js";
import ownerEmailModel from "../models/ownerEmailModel.js";


/**
 * ADMIN → CREATE HOSTEL OWNER
 */
export const createOwnerController = async (req, res) => {
  try {
    const { name, email, phone, password, owneramount } = req.fields;
    const { photo } = req.files;

    if (!name || !email || !phone || !password || !owneramount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Owner already exists with this email",
      });
    }

    // ✅ CREATE OWNER WITH PLATFORM EMAIL
    const owner = new userModel({
      name,
      email,
      phone,
      password,
      owneramount,
      role: "owner",
      hostelId: null,
    });

    // 📸 PHOTO UPLOAD
    if (photo) {
      if (photo.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Photo must be less than 2MB",
        });
      }

      owner.photo.data = fs.readFileSync(photo.path);
      owner.photo.contentType = photo.type;
    }

    await owner.save();

    res.status(201).json({
      success: true,
      message: "Hostel owner created successfully",
      owner: {
        name: owner.name,
        email: owner.email,
      },
    });
  } catch (error) {
    console.error("Create Owner Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const ownerPhotoController = async (req, res) => {
  try {
    const owner = await userModel.findById(req.params.ownerId).select("photo");

    if (owner?.photo?.data) {
      res.set("Content-Type", owner.photo.contentType);
      return res.status(200).send(owner.photo.data);
    }
  } catch (error) {
    res.status(404).send("No photo");
  }
};


export const getAllOwnersController = async (req, res) => {
  try {
    // Get all owners
    const owners = await userModel
      .find({ role: "owner" })
      .select("-password")
      .lean(); // IMPORTANT

    // Attach hostel info to each owner
    for (let owner of owners) {
      const hostel = await hostelModel.findOne(
        { owner: owner._id },
        "name city pincode" // ✅ only required fields
      );

      owner.hostel = hostel || null;
    }

    res.status(200).json({
      success: true,
      total: owners.length,
      owners,
    });
  } catch (error) {
    console.error("Get Owners Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch owners",
    });
  }
};

export const toggleVehicleAccessController = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // 1️⃣ Find owner
    const owner = await userModel.findById(ownerId);

    if (!owner || owner.role !== "owner") {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    // 2️⃣ Block action if owner is disabled
    if (!owner.isActive) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify vehicle access for a deactivated owner",
      });
    }

    // 3️⃣ Toggle access
    owner.vehicleAccess = !owner.vehicleAccess;
    await owner.save();

    return res.status(200).json({
      success: true,
      message: `Vehicle access ${
        owner.vehicleAccess ? "enabled" : "disabled"
      } successfully`,
      vehicleAccess: owner.vehicleAccess,
    });

  } catch (error) {
    console.error("TOGGLE VEHICLE ACCESS ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle access",
    });
  }
};


export const deactivateOwnerController = async (req, res) => {
  try {
    const { ownerId } = req.params;

    /* ================= 1️⃣ DISABLE OWNER ================= */
    const owner = await userModel.findByIdAndUpdate(
      ownerId,
      { isActive: false },
      { new: true }
    );

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    /* ================= 2️⃣ FIND HOSTEL ================= */
    const hostel = await hostelModel.findOne({ owner: ownerId });

    /* ================= 3️⃣ DISABLE HOSTEL ================= */
    if (hostel) {
      await hostelModel.updateOne(
        { _id: hostel._id },
        { isActive: false }
      );

      /* ================= 4️⃣ DISABLE ROOMS ================= */
      await roomModel.updateMany(
        { hostelId: hostel._id },
        { isActive: false }
      );
    }

    /* ================= 5️⃣ DISABLE STUDENTS ================= */
    await studentModel.updateMany(
      { owner: ownerId },
      { isActive: false }
    );

    /* ================= 6️⃣ DISABLE VEHICLES ================= */
    await vehicleModel.updateMany(
      { owner: ownerId },
      { isActive: false }
    );

    /* ================= 7️⃣ DISABLE ATTENDANCE ================= */
    await attandanceModel.updateMany(
      { owner: ownerId },
      { isActive: false }
    );

    return res.status(200).json({
      success: true,
      message: "Owner, hostel, rooms, students, vehicles & attendance disabled successfully",
    });

  } catch (error) {
    console.error("Deactivate Owner Error ❌", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const activateOwnerController = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await userModel.findByIdAndUpdate(
      ownerId,
      { isActive: true },
      { new: true }
    );

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const hostel = await hostelModel.findOne({ owner: ownerId });

    if (hostel) {
      await hostelModel.updateOne(
        { _id: hostel._id },
        { isActive: true }
      );

      await roomModel.updateMany(
        { hostelId: hostel._id },
        { isActive: true }
      );
    }

    await studentModel.updateMany(
      { owner: ownerId },
      { isActive: true }
    );

    res.status(200).json({
      success: true,
      message: "Owner and related data reactivated successfully",
    });
  } catch (error) {
    console.error("Activate Owner Error ❌", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAdminDashboardStatsController = async (req, res) => {
  try {
    /* ================= OWNERS ================= */
    // Only users with role = "owner"
    const totalOwners = await userModel.countDocuments({
      role: "owner",
    });

    /* ================= ACTIVE OWNERS ================= */
    const activeUsers = await userModel.countDocuments({
      role: "owner",
      isActive: true,
    });

    /* ================= HOSTELS ================= */
    const totalHostels = await hostelModel.countDocuments();

    /* ================= TOTAL REVENUE ================= */
    const totalRevenueAgg = await feeModel.aggregate([
      { $match: { status: "PAID" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    /* ================= PENDING AMOUNT ================= */
    const pendingAmountAgg = await feeModel.aggregate([
      { $match: { status: "PENDING" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOwners,
        totalHostels,
        activeUsers,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        pendingAmount: pendingAmountAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

export const hostelDistribution = async (req, res) => {
  try {
    const data = await hostelModel.aggregate([
      {
        $group: {
          _id: "$hosteltype",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHostelWiseOccupancyController = async (req, res) => {
  try {
    const { type } = req.query; // Boys Hostel / Girls Hostel

    const matchStage = type
      ? { "hostel.hosteltype": type }
      : {};

    const data = await roomModel.aggregate([
      {
        $lookup: {
          from: "hostels",
          localField: "hostelId",
          foreignField: "_id",
          as: "hostel",
        },
      },
      { $unwind: "$hostel" },

      ...(type ? [{ $match: matchStage }] : []),

      { $unwind: "$beds" },

      {
        $group: {
          _id: {
            hostelId: "$hostel._id",
            name: "$hostel.name",
          },
          totalBeds: { $sum: 1 },
          occupiedBeds: {
            $sum: {
              $cond: [{ $eq: ["$beds.isOccupied", true] }, 1, 0],
            },
          },
        },
      },

      {
        $addFields: {
          availableBeds: {
            $subtract: ["$totalBeds", "$occupiedBeds"],
          },
          occupancyPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$occupiedBeds", "$totalBeds"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching hostel wise occupancy",
    });
  }
};

export const addOwnerEmailController = async (req, res) => {
  try {

    const { ownerId, email, appPassword } = req.body;

    // check if owner already has email connected
    const existing = await ownerEmailModel.findOne({ ownerId });

    if (existing) {
      return res.status(200).send({
        success: false,
        message: "Email already connected for this owner",
      });
    }

    const ownerEmail = new ownerEmailModel({
      ownerId,
      email,
      appPassword,
    });

    await ownerEmail.save();

    res.status(200).send({
      success: true,
      message: "Email connected successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error connecting email",
      error
    });
  }
};

// 🔥 Toggle email reader (ON/OFF)
export const toggleEmailReaderController = async (req, res) => {
  try {
    const { ownerId } = req.body;

    const owner = await ownerEmailModel.findOne({ ownerId });

    if (!owner) {
      return res.status(404).send({
        success: false,
        message: "Owner email not found",
      });
    }

    // Toggle value
    owner.emailReaderEnabled = !owner.emailReaderEnabled;
    await owner.save();

    res.status(200).send({
      success: true,
      message: `Email Reader ${
        owner.emailReaderEnabled ? "Enabled" : "Disabled"
      }`,
      status: owner.emailReaderEnabled,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in toggling email reader",
    });
  }
};

export const getAllOwnerEmailsController = async (req, res) => {
  try {
    const data = await ownerEmailModel
      .find()
      .populate("ownerId", "name email");

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
    });
  }
};

export const toggleGlobalEmailSystem = async (req, res) => {
  try {
    // 👉 Get current state from any one document
    const one = await ownerEmailModel.findOne();

    if (!one) {
      return res.status(404).json({
        success: false,
        message: "No owner email data found",
      });
    }

    // 👉 Toggle value
    const newStatus = !one.emailSystemEnabled;

    // 👉 Update ALL documents (GLOBAL effect)
    await ownerEmailModel.updateMany(
      {},
      { emailSystemEnabled: newStatus }
    );

    res.status(200).json({
      success: true,
      message: `Email system ${newStatus ? "ENABLED" : "DISABLED"}`,
      status: newStatus,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error toggling global email system",
    });
  }
};



