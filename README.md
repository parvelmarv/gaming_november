# Gaming November: RolloRocket

This is a personal game project featuring **RolloRocket**, a Unity WebGL game embedded in a modern Next.js 16 web application.

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **Game Engine**: Unity (WebGL build)
- **Database**: MongoDB (for leaderboard)
- **Hosting**: Vercel

## Features

- 🎮 **RolloRocket**: Embedded Unity game with fullscreen support.
- 🏆 **Leaderboard**: Real-time high scores powered by MongoDB.
- 📱 **Mobile Support**: Responsive design with orientation handling for gameplay.
- ⚡ **Performance**: Uses Turbopack for fast local dev and optimized production builds.

## Getting Started

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/gaming-november.git
    cd gaming-november
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file with the following keys:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    API_KEY=your_secure_api_key
    DB_NAME=gaming_november
    COLLECTION_NAME=leaderboard
    ```

4.  **Run locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Game Assets

The Unity game build files are stored in **Cloudflare R2** (S3-compatible storage) and served via Next.js API routes (`/api/game-files/*`). This allows for secure, managed delivery of the game binary, WASM, and data files.

## Deployment

The project is configured for seamless deployment on **Vercel**.
- Pushing to `main` triggers a production build.
- Feature branches trigger preview deployments.
