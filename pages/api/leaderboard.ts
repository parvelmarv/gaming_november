import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface LeaderboardEntry {
  _id?: ObjectId;
  playerName: string;
  time: number;
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

// Helper: Validate score
const validateScore = (score: { playerName: string; time: number }): boolean => {
  return score.time > 0 && score.time <= 300.0;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://www.povelc.com",
    'https://parvelmarv.itch.io/rollo-rocket',
    'https://html-classic.itch.zone',
    'https://*.itch.zone',
    'https://*.itch.io'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  }
  
  if (method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    return res.status(200).end();
  }

  // Rate limit check
  if (!checkRateLimit(req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '')) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // API key validation
  const requestApiKey = req.headers['x-api-key'] as string;
  if (requestApiKey !== apiKey) {
    return res.status(401).json({ 
      error: "Unauthorized",
      message: "Invalid API key"
    });
  }

  const client = await clientPromise;
  const db = client.db(dbName as string);
  const collection = db.collection(collectionName as string);

  if (method === "GET") {
    try {
      const scores = await collection.find<LeaderboardEntry>({})
        .sort({ time: 1 })
        .limit(displayScores)
        .toArray();
      
      const formattedScores = scores.map(score => ({
        playerName: score.playerName,
        time: score.time,
        createdAt: score.createdAt.toISOString()
      }));
      
      return res.status(200).json(formattedScores);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (method === "POST") {
    const { playerName, time } = req.body;

    // Input validation
    if (!playerName || typeof time !== 'number' || !validateScore({ playerName, time })) {
      return res.status(400).json({ 
        error: "Invalid score data",
        received: { playerName, time }
      });
    }

    try {
      const count = await collection.countDocuments();
      if (count >= maxScores) {
        const worstScore = await collection.find<LeaderboardEntry>({})
          .sort({ time: -1 })
          .limit(1)
          .next();
        if (worstScore && worstScore.time <= time) {
          return res.status(200).json({ message: "Score not in top scores" });
        }
      }

      const newScore: LeaderboardEntry = {
        playerName,
        time,
        createdAt: new Date(),
      };

      await collection.insertOne(newScore);

      if (count + 1 > maxScores) {
        const worstScore = await collection.find<LeaderboardEntry>({})
          .sort({ time: -1 })
          .limit(1)
          .next();
        if (worstScore) {
          await collection.deleteOne({ _id: worstScore._id });
        }
      }

      return res.status(201).json({ 
        message: "Score submitted successfully",
        score: {
          playerName,
          time,
          createdAt: newScore.createdAt.toISOString()
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (method === "DELETE") {
    console.log("Clearing leaderboard...");
    try {
        await collection.deleteMany({});
        return res.status(200).json({ message: "Leaderboard cleared successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
} 