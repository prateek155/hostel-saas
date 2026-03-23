import roomModel from "../models/roomModel.js";
import hostelModel from "../models/hostelModel.js";
import studentModel from "../models/studentModel.js";

/**
 * CREATE ROOM (OWNER)
 */
export const createRoomController = async (req, res) => {
  try {
    const { roomNumber, totalBeds, type, floor } = req.body;

    if (!roomNumber || !totalBeds || !floor) {
      return res.status(400).json({
        success: false,
        message: "Room number, floor and total beds are required",
      });
    }

    // 1️⃣ find owner's hostel
    const hostel = await hostelModel.findOne({
      owner: req.user.userId,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // 2️⃣ prevent duplicate room on same floor
    const roomExists = await roomModel.findOne({
      hostelId: hostel._id,
      roomNumber,
      floor,
    });

    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: "Room already exists on this floor",
      });
    }

    // 3️⃣ create beds array (A, B, C...)
    const BED_LABELS = ["A", "B", "C", "D", "E"];

    const beds = BED_LABELS.slice(0, totalBeds).map((label) => ({
      label,
      isOccupied: false,
      studentId: null,
    }));

    // 4️⃣ create room
    const room = await roomModel.create({
      hostelId: hostel._id,
      floor,
      roomNumber,
      beds,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
};

/**
 * GET ALL ROOMS (OWNER)
 */
export const getRoomsController = async (req, res) => {
  try {
    // ✅ FIND OWNER'S HOSTEL
    const hostel = await hostelModel.findOne({
      owner: req.user.userId,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const rooms = await roomModel
      .find({ hostelId: hostel._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("GET ROOMS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

/* FILTER ROOMS BY TYPE */
export const getRoomsByTypeController = async (req, res) => {
  try {
    const { type } = req.params;

    // 1️⃣ Find owner's hostel
    const hostel = await hostelModel.findOne({
      owner: req.user.userId,
    });

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // 2️⃣ Fetch rooms with at least ONE free bed
    const rooms = await roomModel.find({
      hostelId: hostel._id,
      type,
      isActive: true,
      "beds.isOccupied": false, // ✅ key fix
    });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (err) {
    console.error("GET ROOMS BY TYPE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};

/* ASSIGN ROOM + BED (BED-BASED) */
export const assignRoomController = async (req, res) => {
  try {
    const { studentId, roomId, bedNumber } = req.body;

    /* 1️⃣ Validate Input */
    if (!studentId || !roomId || !bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Student, room and bed are required",
      });
    }

    /* 2️⃣ Validate Student */
    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.roomId) {
      return res.status(400).json({
        success: false,
        message: "Student already assigned to a room",
      });
    }

    /* 🔥 IMPORTANT: Check monthlyRent */
    if (!student.monthlyRent || student.monthlyRent <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly rent not configured for this student",
      });
    }

    /* 3️⃣ Validate Room */
    const room = await roomModel.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: "Room not available",
      });
    }

    /* 4️⃣ Find Selected Bed */
    const bed = room.beds.find((b) => b.label === bedNumber);

    if (!bed) {
      return res.status(400).json({
        success: false,
        message: "Invalid bed selected",
      });
    }

    if (bed.isOccupied) {
      return res.status(400).json({
        success: false,
        message: "This bed is already occupied",
      });
    }

    /* 5️⃣ Assign Bed */
    bed.isOccupied = true;
    bed.studentId = studentId;

    /* 6️⃣ Assign Room Details to Student */
    student.roomId = roomId;
    student.bedNumber = bedNumber;

    // ✅ No hostel pricing dependency anymore
    // monthlyRent already exists in student

    await Promise.all([room.save(), student.save()]);

    return res.status(200).json({
      success: true,
      message: "Room and bed assigned successfully",
      monthlyRent: student.monthlyRent,
    });

  } catch (error) {
    console.error("ASSIGN ROOM ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign room",
    });
  }
};

/**
 * GET ALL ROOMS BY HOSTEL ID (ADMIN)
 * Route: GET /room/admin/hostel/:hostelId
 */
export const getHostelRoomsAdminController = async (req, res) => {
  try {
    const { hostelId } = req.params;

    const rooms = await roomModel
      .find({ hostelId, isActive: true })
      .sort({ floor: 1, roomNumber: 1 });

    // compute summary from beds[].isOccupied
    const totalBeds = rooms.reduce((s, r) => s + r.beds.length, 0);
    const occupiedBeds = rooms.reduce(
      (s, r) => s + r.beds.filter((b) => b.isOccupied).length,
      0
    );
    const availableBeds = totalBeds - occupiedBeds;

    res.status(200).json({
      success: true,
      rooms,
      summary: {
        totalRooms: rooms.length,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("GET HOSTEL ROOMS ADMIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
};