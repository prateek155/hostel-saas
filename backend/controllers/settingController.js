import settingModel from "../models/settingModel.js";

// ── helper: get or create the single settings document ──
const getOrCreateSettings = async () => {
  let settings = await settingModel.findOne();
  if (!settings) settings = await settingModel.create({});
  return settings;
};

/* ─────────────────────────────────────────────────────────
   GET  /api/v1/settings
   Returns the full settings document
───────────────────────────────────────────────────────── */
export const getSettingsController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/maintenance-mode
   Toggles maintenanceMode boolean
───────────────────────────────────────────────────────── */
export const toggleMaintenanceModeController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.maintenanceMode = !settings.maintenanceMode;
    await settings.save();
    res.status(200).json({
      success: true,
      message: `Maintenance mode ${settings.maintenanceMode ? "enabled" : "disabled"}`,
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    console.error("toggleMaintenanceMode error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle maintenance mode" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/owner-theme
   Body: { theme: "blue" | "green" | "purple" | "orange" }
───────────────────────────────────────────────────────── */
export const updateOwnerThemeController = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ success: false, message: "Theme is required" });

    const settings = await getOrCreateSettings();
    settings.ownerTheme = theme;
    await settings.save();
    res.status(200).json({ success: true, message: `Owner theme set to ${theme}`, ownerTheme: theme });
  } catch (error) {
    console.error("updateOwnerTheme error:", error);
    res.status(500).json({ success: false, message: "Failed to update owner theme" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/student-theme
   Body: { theme: "blue" | "green" | "purple" | "orange" }
───────────────────────────────────────────────────────── */
export const updateStudentThemeController = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ success: false, message: "Theme is required" });

    const settings = await getOrCreateSettings();
    settings.studentTheme = theme;
    await settings.save();
    res.status(200).json({ success: true, message: `Student theme set to ${theme}`, studentTheme: theme });
  } catch (error) {
    console.error("updateStudentTheme error:", error);
    res.status(500).json({ success: false, message: "Failed to update student theme" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/toggle-view-invoice
───────────────────────────────────────────────────────── */
export const toggleViewInvoiceController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.studentControls.view_invoice = !settings.studentControls.view_invoice;
    await settings.save();
    res.status(200).json({
      success: true,
      message: `View invoice ${settings.studentControls.view_invoice ? "enabled" : "disabled"} for students`,
      canViewInvoice: settings.studentControls.view_invoice,
    });
  } catch (error) {
    console.error("toggleViewInvoice error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle view invoice" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/toggle-edit-profile
───────────────────────────────────────────────────────── */
export const toggleEditProfileController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.studentControls.edit_profile = !settings.studentControls.edit_profile;
    await settings.save();
    res.status(200).json({
      success: true,
      message: `Edit profile ${settings.studentControls.edit_profile ? "enabled" : "disabled"} for students`,
      canEditProfile: settings.studentControls.edit_profile,
    });
  } catch (error) {
    console.error("toggleEditProfile error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle edit profile" });
  }
};

/* ─────────────────────────────────────────────────────────
   PUT  /api/v1/settings/toggle-learning-access
───────────────────────────────────────────────────────── */
export const toggleLearningAccessController = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    settings.learningControls.access_courses = !settings.learningControls.access_courses;
    await settings.save();
    res.status(200).json({
      success: true,
      message: `Learning access ${settings.learningControls.access_courses ? "enabled" : "disabled"} for students`,
      hasLearningAccess: settings.learningControls.access_courses,
    });
  } catch (error) {
    console.error("toggleLearningAccess error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle learning access" });
  }
};
