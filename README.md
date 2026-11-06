Welcome to the repository for Greedy Pig, a collaborative web-based push-your-luck dice game built using React, Vite, and Tailwind CSS, powered by a shared Supabase PostgreSQL backend.

1. Git Pull and NPM Install

To get the project onto your local machine and install all required package dependencies, open your terminal and run the following commands:

# Clone the repository (if you haven't already)
git clone <repository-url>
cd greed_pig

# Pull the latest changes from main
git pull origin main

# Install all project dependencies
npm install

2. The Environment Variables (.env)

Because .env files contain private credentials, Git intentionally ignores them (via .gitignore) and will not transfer them when you pull from GitHub. Therefore, every team member must create their own local .env file.

    Where to create it: Create a file named .env directly in the root directory of your project (right next to the provided .env.example file).

    What's in it: Ask the project leader for the shared database keys (sent via team chat) and paste them directly into your local .env file:

    VITE_SUPABASE_URL=https://fgchefpetkjomfxnsgyr.supabase.co
    VITE_SUPABASE_ANON_KEY=your_shared_anon_key_here

3. The Database Schema (schema.sql)

    Where to find it: The master database structure file is saved as schema.sql right in the root directory of this repository.

    What it does: It establishes our backend architecture on Supabase. It creates two core tables: the players table (which tracks unique user profiles, total career wins, highest scores achieved, and total games played) and the match_results table (which acts as a historical log recording the winner, final score, player count, and timestamp of every completed match). It also applies Row Level Security (RLS) policies to allow public reads and game score inserts.

4. Supabase Dashboard Explained & How to Access It

    How to enter the project: Check your email for an invitation sent by the project leader via Supabase. Accept the invitation, sign in at supabase.com, and select greedy-pig-project from your dashboard.

    Dashboard Explained:

        Table Editor: Lets you visually inspect live data rows inside your players and match_results tables.

        SQL Editor: Where database scripts (like schema.sql) are executed.

        Project Settings (Gear Icon ➔ API): Where you retrieve your Project URL and anon public API key whenever needed.

5. How to Run the Project

Once your dependencies are installed and your .env file is configured, you can launch the local development server:

Look at your terminal output for the local server link (usually http://localhost:5173 or [http://127.0.0.1:5173](http://127.0.0.1:5173)), and open that URL in your web browser to play the game and interact with the database.