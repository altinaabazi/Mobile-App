import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/admin-only", protectRoute, authorizeRoles("admin"), (req, res) => {
  res.json({ message: `Pershendetje admin ${req.user.username}!` });
});

export default router;
