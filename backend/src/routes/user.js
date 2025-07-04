
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


router.put("/update", protectRoute, async (req, res) => {
  try {
    console.log("Req body:", req.body);

    const { username, email, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;

    if (profileImage) {
      // Kontrollo nëse profileImage është data URL (base64) ose URL
      if (profileImage.startsWith("data:")) {
        // Upload në Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profileImage, {
          folder: "profile_images", // opsionale, folder në Cloudinary
          overwrite: true,
          resource_type: "image",
        });
        user.profileImage = uploadResponse.secure_url;
      } else {
        // supozojmë se është URL e mëparshme, ruaj ashtu
        user.profileImage = profileImage;
      }
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", profileImage: user.profileImage });
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
router.get("/", protectRoute, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Gabim në marrjen e përdoruesve:", error);
    res.status(500).json({ message: "Gabim në server" });
  }
});
export default router;
