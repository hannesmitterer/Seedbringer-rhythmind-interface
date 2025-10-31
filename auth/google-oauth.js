const GoogleStrategy = require('passport-google-oauth20').Strategy;

/**
 * HARD-CODED OAuth callback to bypass environment/config drift on Render.
 * This MUST match the Redirect URI registered in Google Cloud Console.
 */
const HARDCODED_CALLBACK_URL = 'https://seedbringer-interface.onrender.com/auth/google/callback';

function parseAllowedEmails(val) {
  if (!val) return [];
  return String(val)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Registers the Google OAuth strategy on the provided passport instance.
 * Reads client ID/secret from environment, but forces the callback URL to the hard-coded value above.
 */
function setupGoogleStrategy(passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn('[auth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. OAuth will fail until secrets are set.');
  }

  const allowedEmails = parseAllowedEmails(process.env.AUTHORIZED_EMAILS);

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: HARDCODED_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || '';
          const user = {
            id: profile.id,
            email: email ? email.toLowerCase() : '',
            displayName: profile.displayName,
          };

          if (allowedEmails.length && (!user.email || !allowedEmails.includes(user.email))) {
            return done(null, false, { message: 'unauthorized_email' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

module.exports = { setupGoogleStrategy };