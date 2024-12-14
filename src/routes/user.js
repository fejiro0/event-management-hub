import express from "express";
import User from "../models/User.js"; 

const router = express.Router();

// Fetch user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find user by ID in the database
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
