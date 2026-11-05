# Getting your public keys (for real accounts)

Doords' online rooms work without a server (PeerJS). Real accounts that follow a player across devices need a backend. Supabase is the easiest; these are the steps.

1. Sign up at https://supabase.com and click **New project**. Pick a name, a database password, and a region near your players.
2. Open the project, then click **Connect** at the top (or go to **Project Settings > API Keys**).
3. Copy two values:
   - **Project URL**: `https://YOUR-PROJECT.supabase.co`
   - **Publishable key**: starts with `sb_publishable_...` (older projects call it the `anon` key). This one is meant to be in browser code.
4. **Never** put the `sb_secret_...` key or the `service_role` key in this repo or any browser code. It bypasses all security.
5. **Authentication > Providers**: enable Email (and Google/Discord if you want).
6. **Authentication > URL Configuration**: set Site URL to your GitHub Pages address, e.g. `https://YOURNAME.github.io/doords/`.
7. **SQL Editor**, run:

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  avatar text,
  wins int default 0,
  games int default 0,
  stats jsonb default '{}'::jsonb
);
alter table profiles enable row level security;
create policy "read all" on profiles for select using (true);
create policy "own insert" on profiles for insert with check (auth.uid() = id);
create policy "own update" on profiles for update using (auth.uid() = id);
```

8. In code:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const sb = supabase.createClient('https://YOUR-PROJECT.supabase.co', 'sb_publishable_xxx');
</script>
```

Docs: https://supabase.com/docs/guides/api/api-keys

Firebase alternative: Project settings > Your apps > Web app (`</>`) > copy the `firebaseConfig` object. Those values are also safe to be public; security comes from your rules.


## How Doords uses it

- The publishable key and this project's URL are already set in `js/game.js` (`SB_KEY`, `SB_URL`). To use a different project, change `SB_URL` (top of the app shell section), or paste it in the app: Sign in screen > Connect, or Settings > Account and connection.
- **Online mode**: email sign up and log in through Supabase Auth. Your record (name, avatar, stats) is saved to the `profiles` table and merged when you sign in on another device.
- **Offline mode** (switch on the login screen, the ONLINE/OFFLINE chip, or Settings): accounts are stored on the device only, online rooms pause, everything else works. Going offline never loses data.
- If your project requires email confirmation, new users must click the email link before logging in (Authentication > Providers > Email).


## Complete procedure from step 7 (SQL) to live game

**7. Create the table.** Supabase dashboard > **SQL Editor** > New query. Paste the SQL block above (it includes the `stats jsonb` column) and press **Run**. You should see "Success. No rows returned". Check **Table Editor** > `profiles` exists with a lock icon (RLS on).

**8. Turn on email sign-up.** **Authentication > Providers > Email**: enabled. For quick testing switch **Confirm email** off; for a public game leave it on (players click the link in their email once).

**9. Put your Project URL in the game.** Either:
- open `js/game.js`, set `const SB_URL='https://YOUR-PROJECT.supabase.co';` (the `SB_KEY` publishable key is already there), or
- run the game, and on the login screen paste the URL and press **Connect** (or Settings > Account and connection > Save URL).

**10. Test locally.** Open `index.html` through a local server (`python3 -m http.server`, then http://localhost:8000). Pick a device layout, choose **Online**, Sign up, finish a game, then check **Table Editor > profiles**: your row and stats should be there.

**11. Test the second device.** Open the game on a phone, Log in with the same email. Your name and record should appear (Settings > Account shows "Synced").

**12. Publish on GitHub Pages.** Create a GitHub repo, upload the files, push to `main`. **Settings > Pages > Source: GitHub Actions** (the included workflow deploys it). Your URL: `https://YOURNAME.github.io/REPO/`.

**13. Tell Supabase the live address.** **Authentication > URL Configuration**: Site URL = your GitHub Pages URL; add it (and `http://localhost:8000`) to **Redirect URLs**. Without this, confirmation emails point to the wrong place.

**14. Pre-launch checks.**
- `sb_secret_` / `service_role` keys appear nowhere in the repo (search for them).
- RLS is on for `profiles` (Table Editor shows it; the policies above allow each player to write only their own row).
- Optional: Authentication > Rate limits, and a custom SMTP (Project Settings > Auth) if you expect many sign-ups, since the built-in email sender is limited.

**15. Troubleshooting.**
- "Could not reach the server": wrong URL, no internet, or you are in Offline mode. Use the chip at the top to switch.
- "Invalid login credentials": wrong password, or the email is not confirmed yet.
- Stats not syncing: check you ran the SQL in step 7 (the `stats` column) and are signed in with an online account, not a guest.
