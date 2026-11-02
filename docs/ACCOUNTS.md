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
  games int default 0
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
