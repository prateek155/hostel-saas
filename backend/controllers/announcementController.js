import sendWhatsApp from "../utils/sendWhatsapp.js";
import studentModel from "../models/studentModel.js";
import announcementModel from "../models/announcementModel.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    const announcement = await announcementModel.create({
      title,
      message,
      hostelId: req.user.hostelId,
      createdBy: req.user.userId
    });

    const students = await studentModel.find({
      hostelId: req.user.hostelId,
      whatsappOptIn: true
    });

    for (const student of students) {
      if (student.phone) {
        await sendWhatsApp(
          student.phone,
          `📢 Hostel Announcement\n\n${title}\n\n${message}`
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Announcement sent via WhatsApp",
      announcement
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
