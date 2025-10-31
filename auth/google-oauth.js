const GoogleStrategy = require('passport-google-oauth20').Strategy;

function setupGoogleStrategy(passport) {
  const allowedEmails = (process.env.AUTHORIZED_EMAILS || process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  const callbackURL = process.env.GOOGLE_CALLBACK_URL || (process.env.GOOGLE_REDIRECT_URI ? (process.env.GOOGLE_REDIRECT_URI.replace(/\/$/, '') + '/auth/google/callback') : 'http://localhost:3000/auth/google/callback');

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || 'CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'CLIENT_SECRET',
      callbackURL: callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value || '').toLowerCase();
      if (allowedEmails.length && !allowedEmails.includes(email)) {
        return cb(null, false);
      }
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email,
        provider: profile.provider
      };
      return cb(null, user);
    }
  ));
}

module.exports = { setupGoogleStrategy: setupGoogleStrategy };