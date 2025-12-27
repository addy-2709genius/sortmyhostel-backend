import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === 'student') {
        req.studentId = decoded.studentId;
      } else if (decoded.adminId) {
        req.adminId = decoded.adminId;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Optional student authentication - doesn't require auth but uses it if provided
export const optionalStudentAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === 'student') {
        req.studentId = decoded.studentId;
      }
    }
    next();
  } catch (error) {
    next(); // Continue even if token is invalid
  }
};

export const authenticateStudent = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'student') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    req.studentId = decoded.studentId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};




