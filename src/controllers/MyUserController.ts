import { Request, Response, NextFunction } from "express";
import User  from "../models/user";

interface AuthRequest extends Request {
  userId?: string;
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    console.log('enter getCurrentUser function')
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized: No user ID found in request" });
      return;
    }

    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      res.status(403).json({ message: "User not found" });
      return;
    }

    res.json(currentUser);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const createCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('reached create');
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    console.log("existingUser"+ existingUser);
    console.log('fetched user');
   
    console.log('existing users!!!');
    console.log(req.body);
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.error(error);
  }
};

export const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, addressLine1, country, city } = req.body;
        const user = await User.findById(req.userId);
  
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.name = name;
        user.addressLine1 = addressLine1;
        user.city = city;
        user.country = country;

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user" });
    }
};
