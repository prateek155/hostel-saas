import studentModel from "../models/studentModel.js";
import hostelModel from "../models/hostelModel.js";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import roomModel from "../models/roomModel.js";
import settingModel from "../models/settingModel.js";

/* ======================================================
   1️⃣ ADD STUDENT (OWNER)
   ====================================================== */
export const addStudentController = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gardianemail,
      gardianName,
      gardianphone,
      gardianAddress,
      joinDate,
      leaveDate,
      studentStatus, // ✅ correct name
    } = req.body;

    // ✅ Proper validation
    if (!name || !email || !phone || !gardianemail) {
      return res.status(400).json({
        success: false,
        message: "Name, email, guardian email and phone are required",
      });
    }

    // ✅ find hostel
    const hostel = await hostelModel.findOne({ owner: req.user.userId });
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // ✅ prevent duplicate student
    const exists = await studentModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Student already exists",
      });
    }

    // ✅ generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ✅ generate QR token (ADD THIS)
    const qrCodeToken = crypto.randomBytes(16).toString("hex");   

    // ✅ create student
    const student = await studentModel.create({
      name,
      email,
      phone,
      gardianemail,
      gardianName,
      gardianphone,
      gardianAddress,
      joinDate,
      leaveDate,
      studentStatus: studentStatus || "active", // ⭐ DEFAULT ACTIVE
      hostelId: hostel._id,
      ownerId: req.user.userId,
      qrCodeToken, 
      resetToken,
      resetTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    // 🔗 password setup link
    const setPasswordLink = `${process.env.FRONTEND_URL}/student/set-password/${resetToken}`;

    // ✉ send email
    await sendEmail({
      to: email,
      subject: "Set Your Hostel Account Password",
      html: `
        <h2>Welcome ${name}</h2>
        <p>You have been registered as a student.</p>
        <p>Click the button below to set your password:</p>
        <a href="${setPasswordLink}"
           style="padding:10px 15px;background:#2563eb;color:white;text-decoration:none;border-radius:5px;">
           Set Password
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Student added and email sent",
      student,
    });
  } catch (error) {
    console.error("ADD STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add student",
    });
  }
};

/* ======================================================
   2️⃣ GET OWNER STUDENTS
   ====================================================== */
export const getOwnerStudentsController = async (req, res) => {
  try {
    const students = await studentModel
      .find({ ownerId: req.user.userId })
      .populate("roomId", "roomNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

/* ======================================================
   4️⃣ STUDENT LOGIN
   ====================================================== */
export const studentLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const student = await studentModel
      .findOne({ email })
      .select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!student.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please set your password first",
      });
    }

    if (student.studentStatus === "suspended") {
  return res.status(403).json({
    success: false,
    message: "Your account has been suspended. Please contact the hostel admin.",
  });
}


    const match = await student.comparePassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    student.lastLogin = new Date();
    await student.save();

    const token = JWT.sign(
      {
        studentId: student._id,
        role: "student",
        hostelId: student.hostelId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    student.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      student,
    });
  } catch (error) {
    console.error("STUDENT LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getUnassignedStudentsController = async (req, res) => {
  try {
    const students = await studentModel.find({
      ownerId: req.user.userId,
      roomId: null,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("UNASSIGNED STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

/* ======================================================
   6️⃣ GET ASSIGNED STUDENTS (OWNER)
   ====================================================== */
export const getAssignedStudentsController = async (req, res) => {
  try {
    const students = await studentModel
      .find({
        ownerId: req.user.userId,
        roomId: { $ne: null }, // ✅ assigned students
        isActive: true,
      })
      .populate("roomId", "roomNumber type floor")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("ASSIGNED STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned students",
    });
  }
};

/* ======================================================
   7️⃣ GET ALL STUDENTS (ADMIN)
   ====================================================== */
export const getAllStudentsController = async (req, res) => {
  try {
    const students = await studentModel
      .find()
      .populate("hostelId", "name city pincode")
      .populate("ownerId", "name email")
      .populate("roomId", "roomNumber roomType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("GET ALL STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all students",
    });
  }
};

/* ======================================================
   8️⃣ GET STUDENTS BY OWNER (ADMIN)
   ====================================================== */
export const getStudentsByOwnerController = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required",
      });
    }

    const students = await studentModel
      .find({ ownerId })
      .populate("hostelId", "name city pincode")
      .populate("ownerId", "name email")
      .populate("roomId", "roomNumber roomType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("GET OWNER STUDENTS (ADMIN) ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch owner students",
    });
  }
};

/**
 * ===============================
 * STUDENT SET PASSWORD
 * ===============================
 */
export const setStudentPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    const student = await studentModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Set password
    student.password = password;
    student.isVerified = true;
    student.resetToken = null;
    student.resetTokenExpiry = null;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully. You can now login.",
    });
  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set password",
    });
  }
};

// UPDATE STUDENT (OWNER)
export const updateStudentController = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      name,
      phone,
      gardianemail,
      gardianphone,
      leaveDate,
      studentStatus,
    } = req.body;

    const student = await studentModel.findOne({
      _id: studentId,
      ownerId: req.user.userId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (gardianemail) student.gardianemail = gardianemail;
    if (gardianphone) student.gardianphone = gardianphone;

    if (leaveDate !== undefined) {
      student.leaveDate = leaveDate;
    }

    if (studentStatus) {
      student.studentStatus = studentStatus;
      student.isActive = studentStatus === "active"; // 🔥 CRITICAL
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
    });
  }
};


// DELETE STUDENT (OWNER)
export const deleteStudentController = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Find student FIRST (do NOT delete yet)
    const student = await studentModel.findOne({
      _id: studentId,
      ownerId: req.user.userId, // 🔐 owner check
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2️⃣ If student has room & bed → FREE IT
    if (student.roomId && student.bedNumber) {
      const room = await roomModel.findById(student.roomId);

      if (room) {
        const bed = room.beds.find(
          (b) => b.label === student.bedNumber
        );

        if (bed) {
          bed.isOccupied = false;
          bed.studentId = null;
        }

        await room.save();
      }
    }

    // 3️⃣ NOW delete student
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: "Student deleted and bed released successfully",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
    });
  }
};

/* ======================================================
   GET STUDENT PROFILE (STUDENT)
   ====================================================== */
export const getStudentProfileController = async (req, res) => {
  try {
    const studentId = req.user.studentId; // from JWT token

    const student = await studentModel
      .findById(studentId)
      .populate("roomId", "roomNumber floor type capacity beds attachedBathroom balcony")
      .populate("hostelId", "name address city pincode")
      .populate("ownerId", "name email phone");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Remove sensitive fields
    student.password = undefined;
    student.resetToken = undefined;
    student.resetTokenExpiry = undefined;

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("GET STUDENT PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/* ======================================================
   UPDATE STUDENT PROFILE (STUDENT)
   ====================================================== */
export const updateStudentProfileController = async (req, res) => {
  try {

      // 🔐 ADMIN CONTROL CHECK (ADD THIS)
    const settings = await settingModel.findOne();

    if (settings && !settings.studentControls?.edit_profile) {
      return res.status(403).json({
        success: false,
        message: "Profile editing is disabled by admin",
      });
    }

    const studentId = req.user.studentId; // from JWT token
    const {
      phone,
      guardianName,
      guardianPhone,
      guardianAddress,
      dateOfBirth,
      gender,
      emergencyContact,
    } = req.body;

    const student = await studentModel.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Update allowed fields
    if (phone) student.phone = phone;
    if (guardianName) student.gardianName = guardianName;
    if (guardianPhone) student.gardianphone = guardianPhone;
    if (guardianAddress) student.gardianAddress = guardianAddress;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;
    if (emergencyContact) student.emergencyContact = emergencyContact;

    await student.save();

    // Remove sensitive fields
    student.password = undefined;
    student.resetToken = undefined;
    student.resetTokenExpiry = undefined;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("UPDATE STUDENT PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/* ======================================================
   GET STUDENT ACTIVITY LOG (STUDENT)
   ====================================================== */
export const getStudentActivityLogController = async (req, res) => {
  try {
    const studentId = req.user.studentId; // from JWT token

    // Import activityLogModel at the top if you have one
    // import activityLogModel from "../models/activityLogModel.js";

    const activities = await activityLogModel
      .find({ studentId })
      .sort({ createdAt: -1 })
      .limit(50); // Last 50 activities

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("GET ACTIVITY LOG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log",
    });
  }
};

/* ======================================================
   GET STUDENT DASHBOARD STATS (STUDENT)
   ====================================================== */
export const getStudentDashboardStatsController = async (req, res) => {
  try {
    const studentId = req.user.studentId; // from JWT token

    const student = await studentModel
      .findById(studentId)
      .populate("roomId")
      .populate("hostelId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Calculate days stayed
    const joinDate = new Date(student.joinDate);
    const today = new Date();
    const daysStayed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    const monthsStayed = Math.floor(daysStayed / 30);

    // Get payment status (you can modify based on your payment model)
    let paymentStatus = "paid";
    const lastPayment = await paymentModel
      .findOne({ studentId })
      .sort({ createdAt: -1 });

    if (lastPayment) {
      paymentStatus = lastPayment.status;
    }

    // Get upcoming payment due date
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    res.status(200).json({
      success: true,
      stats: {
        daysStayed,
        monthsStayed,
        monthlyRent: student.roomPrice || 0,
        roomNumber: student.roomId?.roomNumber || "N/A",
        paymentStatus,
        nextDueDate,
        totalPaid: student.roomPrice * monthsStayed,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
