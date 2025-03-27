import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Collections } from '../constants/collections.constants';
import { StatusCodes } from '../constants/status-codes.constants';
import { secretVariables } from '../constants/environments.constants';

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.header('authToken') || req.cookies?.token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, secretVariables.SECRET_KEY as string) as { uid: string };

    const user = await Collections.USER.findOne({ googleId: decoded.uid }).populate('role');
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized: User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

const restrictTo = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role?.permissions.includes(requiredPermission)) {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

export { authMiddleware, restrictTo };
