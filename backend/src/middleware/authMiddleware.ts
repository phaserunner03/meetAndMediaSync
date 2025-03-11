import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.header('authToken');
    if (!token) {
      token = req.cookies?.token;
    }
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!);
    const user = await User.findOne({ googleId: (decoded as any).uid }).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const restrictTo = (permissions: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user.role.permissions.includes(permissions)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

export { authMiddleware, restrictTo };
