import jwt from 'jsonwebtoken';

export function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Return the decoded user data
  } catch (error) {
    throw new Error('Unauthorized');
  }
}