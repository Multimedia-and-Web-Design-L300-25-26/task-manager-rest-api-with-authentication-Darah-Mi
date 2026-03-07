import jwt from "jsonwebtoken";
import User from "../models/User.js";


// 1. Extract token from Authorization header
// 2. Verify token
// 3. Find user
// 4. Attach user to req.user
// 5. Call next()
// 6. If invalid → return 401

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "testsecret";

    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    const safeUser = { ...user };
    if (safeUser.password) delete safeUser.password;

    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
