import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    // Check if the user is logged in
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(request);
      userId = user.id; // Extract user ID from the JWT
    }

    if (userId) {
      // Fetch data from MongoDB for logged-in users
      const client = await clientPromise;
      const db = client.db('DBoptima');
      const collection = db.collection('querylog');
      const queryLogs = await collection.find({ userId }).toArray();
      return new Response(JSON.stringify(queryLogs), { status: 200 });
    } else {
      // Return an empty array for guest users (handled on the frontend)
      return new Response(JSON.stringify([]), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching query logs:', error);
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    // Check if the user is logged in
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(request);
      userId = user.id; // Extract user ID from the JWT
    }

    const { query, timestamp, fileName } = await request.json();

    if (userId) {
      // Save data to MongoDB for logged-in users
      const client = await clientPromise;
      const db = client.db('DBoptima');
      const collection = db.collection('querylog');

      await collection.insertOne({
        userId,
        query,
        timestamp,
        fileName,
      });

      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } else {
      // Return an error for guest users (handled on the frontend)
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
    }
  } catch (error) {
    console.error('Error saving query log:', error);
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    let userId = null;

    // Check if the user is logged in
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(request);
      userId = user.id; // Extract user ID from the JWT
    }

    if (userId) {
      // Delete all queries for the logged-in user
      const client = await clientPromise;
      const db = client.db('DBoptima');
      const collection = db.collection('querylog');

      await collection.deleteMany({ userId });

      return new Response(JSON.stringify({ success: true, message: 'All queries deleted' }), { status: 200 });
    } else {
      // Return an error for unauthorized users
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
    }
  } catch (error) {
    console.error('Error deleting query logs:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}