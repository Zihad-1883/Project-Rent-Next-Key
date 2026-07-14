import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Custom request interface for routes that contain authenticated user data from middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'tenant' | 'landlord';
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token required or malformed.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET missing.' });
      return;
    }

    const decoded = jwt.verify(token, secret) as { id: string; role: 'tenant' | 'landlord' };
    
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
};
