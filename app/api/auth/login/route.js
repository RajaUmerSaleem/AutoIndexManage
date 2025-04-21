import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const client = await clientPromise;
    const db = client.db('DBoptima');
    const usersCollection = db.collection('Users');

    // Find the user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), { status: 401 });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), { status: 401 });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Store your JWT secret in .env
      { expiresIn: '1d' }
    );

    return new Response(JSON.stringify({ success: true, token }), { status: 200 });
  } catch (error) {
    console.error('Error logging in user:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}