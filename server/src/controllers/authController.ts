import { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { User } from '../types/database.js';
import { ObjectId } from 'mongodb';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Helper to sign JWT
const signToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation checks
    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields (name, email, password, role) are required.' });
      return;
    }

    if (role !== 'tenant' && role !== 'landlord') {
      res.status(400).json({ success: false, message: "Role must be either 'tenant' or 'landlord'." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    // 2. Check if user already exists
    const db = await getDb();
    const existingUser = await db.collection<User>('users').findOne({ email: email.toLowerCase() });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create new user document
    const newUser: User = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: new Date()
    };

    const result = await db.collection<User>('users').insertOne(newUser);
    const userId = result.insertedId.toString();

    // 5. Sign Token and Respond
    const token = signToken(userId, role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email: newUser.email,
        role
      }
    });
  } catch (error: any) {
    console.error('Error during user registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    // 2. Find user
    const db = await getDb();
    const user = await db.collection<User>('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const userId = user._id!.toString();

    // 4. Sign Token and Respond
    const token = signToken(userId, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error during user login:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. User context missing.' });
      return;
    }

    const db = await getDb();
    const user = await db.collection<User>('users').findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching user.' });
  }
};
