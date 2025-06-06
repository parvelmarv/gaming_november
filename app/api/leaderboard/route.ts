import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { timeStamp } from 'console';

interface LeaderboardEntry {
  _id?: ObjectId;
  playerName: string;
  time: number;
  level: number;
  createdAt: Date;
}

// Load environment variables
const mongoURI = process.env.MONGODB_URI;
const apiKey = process.env.API_KEY;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;

if (!mongoURI || !apiKey || !dbName || !collectionName) {
  throw new Error('Missing required environment variables');
}

const maxRequests = 100;
const rateLimitWindow = 60 * 1000; // 1 minute
const maxScores = 20;
const displayScores = 10;

// Rate limit tracking
const rateLimit = new Map<string, number[]>();

// Helper: Check if IP is within rate limit
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();

  cleanupRateLimits();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip) || [];
  const recentRequests = timestamps.filter((timestamp) => now - timestamp <= rateLimitWindow);
  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
};

const cleanupRateLimits = () => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimit.entries()) {
    const recentRequests = timestamps.filter(
      (timestamp) => now - timestamp <= rateLimitWindow
    );
    if (recentRequests.length === 0) {
      rateLimit.delete(ip);
    } else {
      rateLimit.set(ip, recentRequests);
    }
  }
}

// Helper: Validate score
const validateScore = (score: { playerName: string; time: number }): boolean => {
  return score.time > 0 && score.time <= 300.0;
};

// Helper: Add CORS headers to response
const addCorsHeaders = (response: NextResponse, origin: string | null) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://www.povelc.com",
    'https://parvelmarv.itch.io',
    'https://html-classic.itch.zone',
    'https://www.gamingnovember.com'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
};

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

  if (!checkRateLimit(ip)) {
    return addCorsHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      origin
    );
  }

  // API key validation
  const requestApiKey = request.headers.get('x-api-key');
  if (requestApiKey !== apiKey) {
    return addCorsHeaders(
      NextResponse.json({ 
        error: "Unauthorized",
        message: "Invalid API key"
      }, { status: 401 }),
      origin
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName as string);
    const collection = db.collection(collectionName as string);

    // Get level from URL parameters
    const { searchParams } = new URL(request.url);
    const level = parseInt(searchParams.get('level') || '0');

    const scores = await collection.find<LeaderboardEntry>({ level })
      .sort({ time: 1 })
      .limit(displayScores)
      .toArray();
    
    const formattedScores = scores.map(score => ({
      playerName: score.playerName,
      time: score.time,
      level: score.level,
      createdAt: score.createdAt.toISOString()
    }));
    
    return addCorsHeaders(NextResponse.json(formattedScores), origin);
  } catch (err) {
    console.error(err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 }),
      origin
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

  if (!checkRateLimit(ip)) {
    return addCorsHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      origin
    );
  }

  // API key validation
  const requestApiKey = request.headers.get('x-api-key');
  if (requestApiKey !== apiKey) {
    return addCorsHeaders(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      origin
    );
  }

  try {
    const body = await request.json();
    const { playerName, time, level = 0 } = body;

    // Input validation
    if (!playerName || typeof time !== 'number' || !validateScore({ playerName, time })) {
      return addCorsHeaders(
        NextResponse.json({ 
          error: "Invalid score data",
          received: { playerName, time, level }
        }, { status: 400 }),
        origin
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName as string);
    const collection = db.collection(collectionName as string);

    const count = await collection.countDocuments({ level });
    if (count >= maxScores) {
      const worstScore = await collection.find<LeaderboardEntry>({ level })
        .sort({ time: -1 })
        .limit(1)
        .next();
      if (worstScore && worstScore.time <= time) {
        return addCorsHeaders(
          NextResponse.json({ message: "Score not in top scores" }),
          origin
        );
      }
    }

    const newScore: LeaderboardEntry = {
      playerName,
      time,
      level,
      createdAt: new Date(),
    };

    await collection.insertOne(newScore);

    if (count + 1 > maxScores) {
      const worstScore = await collection.find<LeaderboardEntry>({ level })
        .sort({ time: -1 })
        .limit(1)
        .next();
      if (worstScore) {
        await collection.deleteOne({ _id: worstScore._id });
      }
    }

    return addCorsHeaders(
      NextResponse.json({ 
        message: "Score submitted successfully",
        score: {
          playerName,
          time,
          level,
          createdAt: newScore.createdAt.toISOString()
        }
      }, { status: 201 }),
      origin
    );
  } catch (err) {
    console.error(err);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 }),
      origin
    );
  }
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://www.povelc.com",
    'https://parvelmarv.itch.io/rollo-rocket',
    'https://html-classic.itch.zone',
    'https://*.itch.zone',
    'https://*.itch.io'
  ];

  if (allowedOrigins.includes(origin as string)) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin as string,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // API key validation
  const requestApiKey = request.headers.get('x-api-key');
  if (requestApiKey !== apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName as string);
    const collection = db.collection(collectionName as string);
    
    await collection.deleteMany({});
    return NextResponse.json({ message: "Leaderboard cleared successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
} 