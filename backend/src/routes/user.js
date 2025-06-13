import express from "express";
import protectRoute from "../middleware/auth.middleware.js";



const router = express.Router();

router.get("/profile", protectRoute, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profileImage: req.user.profileImage,
      },
    });
  } catch (error) {
    console.log("Profile route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
