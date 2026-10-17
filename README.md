# BloodBridge – Part 1: Donor & Attender Module

## Run
1. `npm install`
2. Copy `.env.example` to `.env` and add your Supabase URL + anon key
3. Run `supabase/part1_schema.sql` in the Supabase SQL editor (or merge into Part 3's master schema)
4. `npm run dev`

## Covered
- Sign up / sign in with role (donor or attender)
- Donor profile (blood group, approximate area, availability)
- Attender: create request, dashboard, request detail
- Add donors: invite from the platform, or create a link for a donor found outside (WhatsApp share)
- Donor: accept / decline / cancel via secured RPC; dashboard with pending + history

## Integration points
- Part 2 (Hospital): updates `request_participants.status` (arrived/donated/deferred/no_show) and `blood_requests.units_fulfilled` / `status`.
- Part 3 (Supabase): reconcile table/column names; swap my schema file for the master one.
- Part 4: sets `donors.id_verified`; trust history reads `request_participants`.
# bloodbridge
