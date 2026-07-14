import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';

export const requireRole = (allowedRoles: ('tenant' | 'landlord')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authentication context missing.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}.` });
      return;
    }

    next();
  };
};

export const requireLandlord = requireRole(['landlord']);
export const requireTenant = requireRole(['tenant']);
