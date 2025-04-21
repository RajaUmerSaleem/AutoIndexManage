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
      const collection = db.collection('indexapplied');
      const appliedIndexes = await collection.find({ userId }).toArray();
      return new Response(JSON.stringify(appliedIndexes), { status: 200 });
    } else {
      // Return an empty array for guest users
      return new Response(JSON.stringify([]), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching applied indexes:', error);
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

    const { indexName, tableName, columns, improvement, timestamp } = await request.json();

    if (userId) {
      // Save data to MongoDB for logged-in users
      const client = await clientPromise;
      const db = client.db('DBoptima');
      const collection = db.collection('indexapplied');

      await collection.insertOne({
        userId,
        indexName,
        tableName,
        columns,
        improvement,
        timestamp,
      });

      return new Response(JSON.stringify({ success: true }), { status: 201 });
    } else {
      // Return an error for guest users
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
    }
  } catch (error) {
    console.error('Error saving applied index:', error);
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 });
  }
}