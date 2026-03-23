import messMenuModel from "../models/messMenuModel.js";
/**
 * OWNER → CREATE / UPDATE MESS MENU (DAY-WISE)
 */
export const upsertMessMenuController = async (req, res) => {
  try {
    const { menu } = req.body;

    // ✅ from JWT (as you already use)
    const ownerId = req.user.userId;
    const hostelId = req.user.hostelId;

    if (!menu) {
      return res.status(400).json({
        success: false,
        message: "Menu data is required",
      });
    }

    // 🔥 UPSERT: update same document, create only if not exists
    const updatedMenu = await messMenuModel.findOneAndUpdate(
      { ownerId, hostelId, isActive: true }, // find condition
      { menu },                              // update
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Mess menu saved successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("MESS MENU UPSERT ERROR ❌", error);

    // Duplicate key safety (unique index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mess menu already exists for this hostel",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save mess menu",
    });
  }
};

/**
 * OWNER / STUDENT → GET CURRENT MESS MENU
 */
export const getCurrentMessMenuController = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    const menu = await messMenuModel.findOne({
      hostelId,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("GET MESS MENU ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mess menu",
    });
  }
};

/**
 * OWNER → DELETE MESS MENU (Soft delete)
 */
export const deleteMessMenuController = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const hostelId = req.user.hostelId;

    await messMenuModel.findOneAndUpdate(
      { ownerId, hostelId, isActive: true },
      { isActive: false }
    );

    return res.status(200).json({
      success: true,
      message: "Mess menu deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MENU ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete menu",
    });
  }
};
