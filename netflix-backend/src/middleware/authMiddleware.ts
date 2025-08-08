import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const authService = new AuthService();

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No valid authorization header found' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await authService.verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
