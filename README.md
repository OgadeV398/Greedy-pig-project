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

Teammates should **never** create tables individually on the Supabase UI without a plan, as uncoordinated schema changes will break other people's code or wipe out existing tables.

Here is the standard, clean workflow for handling new database features without conflicts:

---

### 1. The Core Rule: Centralized Schema Updates

Instead of members clicking around in Supabase to make tables on their own, all database changes follow this simple lifecycle:

1. **Discuss the New Table First:** If a teammate needs a new table (for example, `achievements` or `chat_messages`), they define the table structure in team chat first.
2. **Append to `schema.sql`:** The new table code is added to the master `schema.sql` file in Git so it is documented for everyone.
3. **Run the New Block in Supabase:** Execute *only* the new SQL block in the Supabase SQL Editor.

---

### 2. How `CREATE TABLE IF NOT EXISTS` Prevents Conflicts

Because of how we wrote your original SQL queries, existing data will never be overwritten or broken when adding new tables.

Every new table script should be written using `IF NOT EXISTS`. For example, if a teammate needs a table for game settings, they add this to `schema.sql`:

```sql
-- New feature table added later
CREATE TABLE IF NOT EXISTS public.game_settings (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES public.players(id),
    sound_volume INTEGER DEFAULT 80,
    theme TEXT DEFAULT 'classic'
);

```

Because of `IF NOT EXISTS`:

* Running this script will **only** create `game_settings`.
* It will completely leave your existing `players` and `match_results` tables untouched.

---

### 3. Modifying Existing Tables Safely (Adding Columns)

If a requirement demands adding a new field to an existing table (e.g., adding `avatar_url` to the `players` table), members should **never drop or recreate** the table.

Instead, they use an `ALTER TABLE` statement:

```sql
-- Safe way to add a column without deleting existing players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'default_pig.png';

```

---

### 4. Summary of the Team Workflow

* **Step 1:** Member drafts the SQL code for their new table/column locally.
* **Step 2:** Member pastes the new SQL snippet into the team repository's `schema.sql` file.
* **Step 3:** Member executes that specific new snippet in the shared Supabase **SQL Editor**.
* **Step 4:** Member pushes the updated `schema.sql` to GitHub so everyone stays in sync.