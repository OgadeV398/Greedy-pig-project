# Greedy Pig 🐷

A fast-paced multiplayer push-your-luck dice game built using React, Vite, Tailwind CSS, a secure Node.js/Express backend API, and a PostgreSQL database.

## 🚀 Features

- **Local Multiplayer**: Play live with friends.
- **Server-Side Anti-Cheat Logic**: Dice rolls and score calculations are securely processed on the backend server to prevent client-side manipulation.
- **Global Leaderboard**: Tracks top players by wins and high scores.
- **Advanced Search & Filtering**: Real-time username search and minimum point filters.
- **REST API Endpoints**: Structured backend communication for game sessions, rolling, holding, and leaderboard queries.

---

## 🗄️ Database Setup (PostgreSQL / pgAdmin)

### Database Schemas

**`players` Table**
- `id` (SERIAL, Primary Key)
- `username` (VARCHAR(100), Unique, Not Null)
- `total_wins` (INT, Default 0)
- `highest_score` (INT, Default 0)
- `games_played` (INT, Default 0)
- `created_at` (TIMESTAMP)

**`match_results` Table**
- `id` (SERIAL, Primary Key)
- `winner_name` (VARCHAR(100), Not Null)
- `winning_score` (INT, Not Null)
- `players_count` (INT, Not Null)
- `all_players` (TEXT[] Array, Not Null)
- `played_at` (TIMESTAMP)

---

## 🛠️ Getting Started & Installation

### 1. Clone & Install Dependencies

Open your terminal and run the following commands to set up both the frontend and backend environments:

```bash
# Clone the repository
git clone <repository-url>
cd greed_pig

# Install frontend dependencies
npm install

# Navigate to backend and install backend dependencies
cd backend
npm install

2. Configure Environment Variables (.env)

Create a .env file inside your backend/ folder with your local PostgreSQL configuration:
Code snippet

PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=greedy_pig
DB_PASSWORD=your_postgres_password
DB_PORT=5432

3. Initialize the Database Schema

    Open pgAdmin and create a database named greed_pig.

    Open the Query Tool on your greed_pig database and execute the following SQL script to establish your tables and seed demo records:


    CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    total_wins INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    games_played INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_results (
    id SERIAL PRIMARY KEY,
    winner_name VARCHAR(100) NOT NULL,
    winning_score INT NOT NULL,
    players_count INT NOT NULL,
    all_players TEXT[] NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Demo Players
INSERT INTO public.players (username, total_wins, highest_score, games_played)
VALUES  
  ('PiggyMaster', 15, 250, 20),
  ('MuddyKing', 12, 210, 18),
  ('OinkPro', 9, 185, 15),
  ('CrispyBacon', 7, 150, 12),
  ('TruffleHunter', 5, 120, 10),
  ('SlopRunner', 3, 95, 8)
ON CONFLICT (username) DO NOTHING;

-- Seed Demo Matches
INSERT INTO public.match_results (winner_name, winning_score, players_count, all_players, played_at)
VALUES  
  ('PiggyMaster', 250, 4, ARRAY['PiggyMaster', 'MuddyKing', 'OinkPro', 'CrispyBacon'], NOW() - INTERVAL '1 hour'),
  ('MuddyKing', 210, 3, ARRAY['MuddyKing', 'OinkPro', 'TruffleHunter'], NOW() - INTERVAL '3 hours'),
  ('OinkPro', 185, 2, ARRAY['OinkPro', 'SlopRunner'], NOW() - INTERVAL '5 hours'),
  ('CrispyBacon', 150, 4, ARRAY['CrispyBacon', 'PiggyMaster', 'MuddyKing', 'SlopRunner'], NOW() - INTERVAL '1 day'),
  ('PiggyMaster', 200, 3, ARRAY['PiggyMaster', 'TruffleHunter', 'OinkPro'], NOW() - INTERVAL '2 days'),
  ('TruffleHunter', 120, 2, ARRAY['TruffleHunter', 'SlopRunner'], NOW() - INTERVAL '3 days');

  How to Run the Project Locally

You will run both the backend server and the frontend client concurrently:
1. Start the Backend Server
Bash

cd backend
node server.js

(Server runs on http://localhost:5000)
2. Start the Frontend Development Server

Open a second terminal window in your root project directory (greed_pig/):
Bash

npm run dev

(Open the local URL provided—usually http://localhost:5173—in your web browser to play).