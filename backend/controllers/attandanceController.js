import attandanceModel from "../models/attandanceModel.js";
import PDFDocument from "pdfkit";


export const markAttendanceController = async (req, res) => {
  try {
    const { studentId, hostelId, status, date } = req.body;
    const ownerId = req.user.userId;

    if (!studentId || !status || !date) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const locked = await attandanceModel.findOne({
      ownerId,
      date: selectedDate,
      locked: true,
    });

    if (locked) {
      return res.status(403).json({
        success: false,
        message: "Attendance locked",
      });
    }

    await attandanceModel.findOneAndUpdate(
      { studentId, ownerId, date: selectedDate },
      {
        studentId,
        hostelId,
        ownerId,
        status,
        date: selectedDate,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Attendance saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Save failed" });
  }
};

export const getAttendanceByDateController = async (req, res) => {
  try {
    const { date } = req.query;
    const ownerId = req.user.userId;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const attendance = await attandanceModel
      .find({ ownerId, date: selectedDate })
      .populate("studentId", "name phone")
      .sort({ createdAt: 1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

export const getMyAttendanceController = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const { date, month } = req.query;

    let filter = { studentId };

    // ✅ DATE-WISE (FIXED – RANGE BASED)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    // ✅ MONTH-WISE (OPTIONAL, SAFE)
    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      filter.date = { $gte: start, $lt: end };
    }

    const attendance = await attandanceModel
      .find(filter)
      .sort({ date: -1 });

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
};

export const lockAttendanceController = async (req, res) => {
  try {
    const { date } = req.body;
    const ownerId = req.user.userId;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    await attandanceModel.updateMany(
      { ownerId, date: selectedDate },
      { locked: true, lockedAt: new Date() }
    );

    res.json({
      success: true,
      message: "Attendance locked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to lock attendance",
    });
  }
};

export const getAttendanceStatsController = async (req, res) => {
  const { studentId } = req.params;
  const ownerId = req.user.userId;

  const total = await attandanceModel.countDocuments({
    studentId,
    ownerId,
  });

  const present = await attandanceModel.countDocuments({
    studentId,
    ownerId,
    status: "present",
  });

  const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

  res.json({
    success: true,
    total,
    present,
    absent: total - present,
    percentage,
  });
};

export const getAttendanceByMonthController = async (req, res) => {
  try {
    const { month } = req.query;
    const ownerId = req.user.userId;

    // 👇 FORCE SAFE UTC RANGE
    const [year, mon] = month.split("-");

    const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0));

    const attendance = await attandanceModel
      .find({
        ownerId,
        date: { $gte: start, $lt: end },
      })
      .populate("studentId", "name roomNumber")
      .sort({ date: 1 });

    res.json({ success: true, attendance });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getAttendanceByRangeController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const ownerId = req.user.userId;

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const attendance = await attandanceModel
      .find({
        ownerId,
        date: { $gte: start, $lte: end },
      })
      .populate("studentId", "name roomNumber")
      .sort({ date: 1 });

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getStudentAttendanceController = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, from, to } = req.query;
    const ownerId = req.user.userId;

    let filter = { studentId, ownerId };

    if (month) {
  const [year, mon] = month.split("-");

  const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0));

  filter.date = { $gte: start, $lt: end };
   }

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      filter.date = { $gte: start, $lte: end };
    }

    const attendance = await attandanceModel
      .find(filter)
      .sort({ date: 1 });

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const downloadStudentAttendancePDFController = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;
    const ownerId = req.user.userId;

    const [year, mon] = month.split("-");

   const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
   const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0));


    const records = await attandanceModel.find({
      studentId,
      ownerId,
      date: { $gte: start, $lt: end },
    });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_${month}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Student Attendance Report", { align: "center" });
    doc.moveDown();

    records.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `${new Date(r.date).toLocaleDateString()} - ${r.status.toUpperCase()}`
        );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
