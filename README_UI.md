# BloodBridge – RedFlow-style UI (Part 1)

Drop-in replacement for the `src/` folder and `index.html` of bloodbridge-part1. Delete the old `src/pages`, `src/components` first so no old files linger.
Backend/schema is unchanged. Run: npm install, add .env, npm run dev.

Pages: Welcome (splash + onboarding), Sign in, Sign up, Forgot password, Verify code, Reset password, Home, Find donor,
Donor profile, My requests / Donate, Post request, Request details, Blood banks, Inbox, Chat (UI only, Part 3),
Alerts (derived, Part 4 can replace), Profile, Edit profile, Invite link.

Notes
- 6-digit verification needs Supabase email templates to include {{ .Token }} (Auth > Email Templates). Otherwise users get a link.
- Google sign-in needs the Google provider enabled in Supabase Auth.
