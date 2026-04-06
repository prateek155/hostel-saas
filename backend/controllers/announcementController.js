import announcementModel from "../models/announcementModel.js";
import studentModel from "../models/studentModel.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * 📢 CREATE ANNOUNCEMENT
 * Hostel owner creates announcement + email sent to students
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    // ✅ create announcement
    const announcement = await announcementModel.create({
      title,
      message,
      hostelId: req.user.hostelId,
      createdBy: req.user.userId
    });

    // ✅ get only this hostel students
    const students = await studentModel.find({
      hostelId: req.user.hostelId
    });

    // ✅ extract valid emails
    const emails = students
      .map((s) => s.email)
      .filter((email) => email && email.trim() !== "");

    // ✅ send email ONLY if emails exist
    if (emails.length > 0) {
      await sendEmail({
        to: emails, // ✅ multiple recipients
        subject: `📢 New Hostel Announcement: ${title}`,
        html: `
          <div style="font-family:Arial;padding:10px">
            <h2>📢 New Announcement</h2>
            <h3>${title}</h3>
            <p>${message}</p>
            <br/>
            <small>This is an official hostel notification.</small>
          </div>
        `,
      });
    } else {
      console.log("⚠️ No valid student emails found");
    }

    res.status(201).json({
      success: true,
      message: "Announcement created & email sent",
      announcement,
    });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


/**
 * 📥 GET ALL ANNOUNCEMENTS (Hostel specific)
 * Students & owners both use this
 */
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel
      .find({ hostelId: req.user.hostelId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });

  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


/**
 * ✏️ UPDATE ANNOUNCEMENT (Owner only)
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    const announcement = await announcementModel.findOneAndUpdate(
      {
        _id: id,
        hostelId: req.user.hostelId // 🔐 security
      },
      {
        title,
        message
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


/**
 * ❌ DELETE ANNOUNCEMENT (Owner only)
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await announcementModel.findOneAndDelete({
      _id: id,
      hostelId: req.user.hostelId // 🔐 security
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or unauthorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};