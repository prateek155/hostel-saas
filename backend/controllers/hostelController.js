import hostelModel from "../models/hostelModel.js";
import userModel from "../models/userModel.js";
import roomModel from "../models/roomModel.js";
import studentModel from "../models/studentModel.js"; 
import emailModel from "../models/emailModel.js";

/**
 * OWNER → CREATE HOSTEL
 */
export const createHostelController = async (req, res) => { 
  try {
    const ownerId = req.user.userId;

    const existingHostel = await hostelModel.findOne({ owner: ownerId });
    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel already created for this owner",
      });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      facilities,
      hosteltype,
    } = req.body;

    const hostel = await hostelModel.create({
      owner: ownerId,
      name,
      address,
      city,
      state,
      pincode,
      facilities,
      hosteltype,
    });

    await userModel.findByIdAndUpdate(ownerId, {
      hostelId: hostel._id,
    });

    res.status(201).json({
      success: true,
      message: "Hostel created successfully",
      hostel,
    });
  } catch (error) {
    console.error("Create hostel error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating hostel",
    });
  }
};


/**
 * OWNER → GET MY HOSTEL
 */
export const getOwnerHostelController = async (req, res) => {
  try {
    const hostel = await hostelModel.findOne({
      owner: req.user.userId,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    res.json({
      success: true,
      hostel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hostel",
    });
  }
};

/**
 * ==================================
 * GET ALL HOSTELS (ADMIN)
 * ==================================
 */
export const getAllHostelsController = async (req, res) => {
  try {
    const hostels = await hostelModel
      .find()
      .populate("owner", "name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: hostels.length,
      hostels,
    });
  } catch (error) {
    console.error("GET ALL HOSTELS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hostels",
    });
  }
};

/**
 * ==================================
 * GET SINGLE HOSTEL (ADMIN)
 * ==================================
 */
export const getSingleHostelController = async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await hostelModel
      .findById(id)
      .populate("owner", "name email phone role");

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    res.status(200).json({
      success: true,
      hostel,
    });
  } catch (error) {
    console.error("GET SINGLE HOSTEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hostel details",
    });
  }
};


export const updateHostelFacilitiesController = async (req, res) => {
  try {
    const { facilities } = req.body;

    if (!Array.isArray(facilities)) {
      return res.status(400).json({
        success: false,
        message: "Facilities must be an array",
      });
    }

    const hostel = await hostelModel.findOne({
      owner: req.user.userId,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    hostel.facilities = facilities.map(f => f.trim());

    await hostel.save();

    res.status(200).json({
      success: true,
      message: "Facilities updated",
      facilities: hostel.facilities,
    });
  } catch (error) {
    console.error("UPDATE FACILITIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update facilities",
    });
  }
};

/**
 * ==================================
 * OWNER → UPDATE MY HOSTEL
 * ==================================
 */
export const updateMyHostelController = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const hostel = await hostelModel.findOne({ owner: ownerId });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const {
      name,
      address,
      city,
      state,
      pincode,
      hosteltype,
      facilities,
      isActive,
    } = req.body;

    // ✅ Update only provided fields
    if (name) hostel.name = name;
    if (address) hostel.address = address;
    if (city) hostel.city = city;
    if (state) hostel.state = state;
    if (pincode) hostel.pincode = pincode;
    if (hosteltype) hostel.hosteltype = hosteltype;
    if (typeof isActive === "boolean") hostel.isActive = isActive;

    if (Array.isArray(facilities)) {
      hostel.facilities = facilities.map(f => f.trim());
    }

    await hostel.save();

    res.status(200).json({
      success: true,
      message: "Hostel updated successfully",
      hostel,
    });
  } catch (error) {
    console.error("UPDATE HOSTEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update hostel",
    });
  }
};

export const getOwnerDashboardStatsController = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const hostel = await hostelModel.findOne({ owner: ownerId });

    if (!hostel) {
      return res.status(200).json({
        success: true,
        stats: {
          totalRooms: 0,
          totalStudents: 0,
          totalRevenue: 0,
          totalDeposit: 0,
          duePayment: 0,
          occupancy: 0,
        },
      });
    }

    // 🔥 FIX: convert hostel._id to string
    const rooms = await roomModel.find({
      hostelId: hostel._id.toString(),
    });

    const totalRooms = rooms.length;

    const totalBeds = rooms.reduce(
      (sum, room) => sum + (room.beds?.length || 0),
      0
    );

    const occupiedBeds = rooms.reduce(
      (sum, room) =>
        sum + (room.beds?.filter(b => b.isOccupied).length || 0),
      0
    );

    const occupancy =
      totalBeds > 0
        ? Math.round((occupiedBeds / totalBeds) * 100)
        : 0;

    const roomIds = rooms.map(r => r._id.toString());

    const students = await studentModel.find({
      roomId: { $in: roomIds },
    });

    const totalStudents = students.length;

    let totalRevenue = 0;

    students.forEach((student) => {
  if (student.studentStatus === "active") {
    totalRevenue += student.monthlyRent || 0;
  }
});
     
    let totalDeposit = 0;

     students.forEach((student) => {
  if (student.studentStatus === "active") {
    totalDeposit += student.Deposit || 0;
  }
});
    let duePayment = 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRooms,
        totalStudents,
        totalRevenue,
        totalDeposit,
        duePayment,
        occupancy,
      },
    });

  } catch (error) {
    console.error("OWNER DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error in dashboard stats",
    });
  }
};

export const getOwnerEmailsController = async (req, res) => {
  try {

    const emails = await emailModel
      .find({ ownerId: req.user.userId })
      .sort({ date: -1 });

    res.status(200).send({
      success: true,
      emails,
    });

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Error fetching emails",
      error,
    });
  }
};