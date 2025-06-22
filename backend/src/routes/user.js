
import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"; // supozojmë ke cloudinary të konfiguruar


const router = express.Router();


// GET /api/users/profile
router.get("/profile", protectRoute, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profileImage: req.user.profileImage,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.log("Profile route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/update
// router.put("/update", protectRoute, async (req, res) => {
//   try {
//     const { username, email } = req.body;

//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.username = username || user.username;
//     user.email = email || user.email;

//     await user.save();

//     res.status(200).json({ message: "User updated successfully" });
//   } catch (error) {
//     console.log("Update user error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.put("/update", protectRoute, async (req, res) => {
  try {
        console.log("Req body:", req.body);  // << shto këtë rresht

    const { username, email, profileImage } = req.body; // merr edhe profileImage

    const user = await User.findById(req.user._id);
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;  // ruaj fotoja

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/change-password", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Fjalëkalimi i ri duhet të jetë të paktën 6 karaktere" });

    user.password = newPassword; // Hash do bëhet nga hook në model
    await user.save();

    res.json({ message: "Fjalëkalimi u ndryshua me sukses" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

export default router;
