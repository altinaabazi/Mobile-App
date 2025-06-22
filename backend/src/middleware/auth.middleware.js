// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const protectRoute = async (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");
//     if (!authHeader) {
//       return res.status(401).json({ message: "No authentication token, access denied" });
//     }

//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Invalid token format" });
//     }

//     const token = authHeader.replace("Bearer ", "").trim();
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId).select("-password");
//     if (!user) return res.status(401).json({ message: "Token is not valid" });

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("Authentication error", error.message);
//     res.status(401).json({ message: "Token is not valid" });
//   }
// };
// export default protectRoute;
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;
