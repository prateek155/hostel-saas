import projectModel from "../models/projectModel.js";

/* ================= CREATE PROJECT ================= */
export const createProject = async (req, res) => {
  try {
    // ✅ Normalize user id (student + other roles)
    const userId = req.user?._id || req.user?.studentId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      type,
      techStack,
      teamSize,
      duration,
    } = req.body;

    if (!techStack || techStack.length === 0) {
      return res.status(400).json({ message: "Tech stack is required" });
    }

    if (!title || !description || !type || !teamSize || !duration) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const project = await projectModel.create({
      ...req.body,
      creator: userId, // ✅ FIX HERE
    });

    const populated = await projectModel
      .findById(project._id)
      .populate("creator", "name email phone");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* ================= GET ALL PROJECTS ================= */
export const getAllProjects = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { techStack: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    const projects = await projectModel
      .find(query)
      .populate("creator", "name email phone")
      .populate("interestedStudents.student", "name email phone")
      .populate("selectedMembers", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE PROJECT ================= */
export const getProjectById = async (req, res) => {
  try {
    const project = await projectModel
      .findById(req.params.id)
      .populate("creator", "name email phone")
      .populate("interestedStudents.student", "name email phone")
      .populate("selectedMembers", "name email phone")
      .populate("tasks.assignedTo", "name email")
      .populate("activities.user", "name")
      .populate("files.uploadedBy", "name");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= MY PROJECTS ================= */
/* ================= MY PROJECTS ================= */
export const getMyProjects = async (req, res) => {
  try {
    // 🔑 works for student / admin / other roles
    const userId = req.user._id || req.user.studentId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const projects = await projectModel
      .find({ creator: userId })
      .populate("creator", "name email phone")
      .populate("selectedMembers", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Get my projects error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ================= SHOW INTEREST ================= */
export const showInterest = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user._id || req.user.studentId; // ✅ SAFE FIX

    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const project = await projectModel.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.status !== "open") {
      return res.status(400).json({ message: "Project closed for interest" });
    }

    // 🚫 Creator cannot apply
    if (project.creator?.toString() === userId.toString()) {
      return res.status(400).json({ message: "Creator cannot apply" });
    }

    // 👥 Team full check
    const currentTeamSize = project.selectedMembers.length + 1;
    if (currentTeamSize >= project.teamSize) {
      return res.status(400).json({ message: "Team is already full" });
    }

    // 🔁 Already applied check
    const alreadyApplied = project.interestedStudents.some(
      (i) => i.student?.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    // ✅ Push interest
    project.interestedStudents.push({
      student: userId,
      reason: reason.trim(),
      status: "pending",
    });

    await project.save();

    res.json({ message: "Interest submitted successfully" });
  } catch (error) {
    console.error("Show interest error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* ================= ACCEPT STUDENT ================= */
export const acceptStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const userId = req.user._id || req.user.studentId; // ✅ FIX

    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    const project = await projectModel.findById(id);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // 🔒 Only creator can accept
    if (project.creator?.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    // 🚫 Already selected
    const alreadySelected = project.selectedMembers.some(
      (m) => m.toString() === studentId.toString()
    );
    if (alreadySelected)
      return res.status(400).json({ message: "Already selected" });

    // 👥 Team full check
    const teamCount = project.selectedMembers.length + 1; // + creator
    if (teamCount >= project.teamSize)
      return res.status(400).json({ message: "Team full" });

    // 🔍 Find interest
    const interest = project.interestedStudents.find(
      (i) => i.student?.toString() === studentId.toString()
    );

    if (!interest)
      return res.status(404).json({ message: "Interest not found" });

    // ✅ Accept student
    interest.status = "accepted";
    project.selectedMembers.push(studentId);

    // 📝 Activity log
    project.activities.push({
      type: "member_joined",
      description: "New member joined project",
      user: studentId,
    });

    // 🔄 Auto start project if team is full
    if (project.selectedMembers.length + 1 === project.teamSize) {
      project.status = "in-progress";
    }

    await project.save();

    res.json({ message: "Student accepted successfully" });
  } catch (error) {
    console.error("Accept student error:", error);
    res.status(500).json({ message: error.message });
  }
};



/* ================= REJECT STUDENT ================= */
export const rejectStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // ✅ Normalize user id (student / admin / other roles)
    const userId = req.user._id || req.user.studentId;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    const project = await projectModel.findById(id);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // 🔒 Only creator can reject
    if (project.creator?.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    // 🔍 Find interest
    const interest = project.interestedStudents.find(
      (i) => i.student?.toString() === studentId.toString()
    );

    if (!interest)
      return res.status(404).json({ message: "Interest not found" });

    // ❌ Reject student
    interest.status = "rejected";
    await project.save();

    res.json({ message: "Student rejected successfully" });
  } catch (error) {
    console.error("Reject student error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ================= CLOSE PROJECT ================= */
export const closeProject = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Normalize user id (student / admin / future roles)
    const userId = req.user._id || req.user.studentId;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    const project = await projectModel.findById(id);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // 🔒 Only creator can close project
    if (project.creator?.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });

    // 🚫 Close interest
    project.status = "in-progress";

    // ❌ Reject all pending interests
    project.interestedStudents.forEach((i) => {
      if (i.status === "pending") i.status = "rejected";
    });

    await project.save();

    res.json({ message: "Project closed for interest" });
  } catch (error) {
    console.error("Close project error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ================= UPDATE PROJECT ================= */
export const updateProject = async (req, res) => {
  try {
    // ✅ Normalize user id (student + other roles)
    const userId = req.user?._id || req.user?.studentId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await projectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔒 Authorization check
    if (project.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedProject = await projectModel
      .findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      )
      .populate("creator", "name email phone");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* ================= DELETE PROJECT ================= */
export const deleteProject = async (req, res) => {
  try {
    // ✅ Normalize user id (student + other roles)
    const userId = req.user?._id || req.user?.studentId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await projectModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔒 Authorization check
    if (project.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* ================= ADD MILESTONE ================= */
export const addMilestone = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title)
      return res.status(400).json({ message: "Milestone title required" });

    const project = await projectModel.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    project.milestones.push({
      title,
      description,
      dueDate
    });

    await project.save();
    res.json({ message: "Milestone added successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= ADD TASK ================= */
export const addTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title)
      return res.status(400).json({ message: "Task title required" });

    const project = await projectModel.findById(req.params.id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (project.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    project.tasks.push({
      title,
      description,
      assignedTo,
      dueDate,
      status: "todo"
    });

    project.activities.push({
      type: "task_added",
      description: "New task added",
      user: req.user._id
    });

    await project.save();
    res.json({ message: "Task added successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= UPDATE TASK STATUS ================= */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const project = await projectModel.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    // 🔒 SECURITY FIX
    if (project.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const task = project.tasks.id(req.params.taskId);
    if (!task)
      return res.status(404).json({ message: "Task not found" });

    task.status = status;

    project.activities.push({
      type: "task_updated",
      description: `Task status updated to ${status}`,
      user: req.user._id
    });

    await project.save();
    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


