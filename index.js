const express = require("express");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; // <-- Import FacebookStrategy

// Initialize express app
const app = express();

// Middleware setup
app.use(cors({
    origin: "http://localhost:3001", // The origin should match your frontend URL
    credentials: true
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: "3776103455936524",
    clientSecret: "1dc23f5438de2809c7427693d29b1524",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'picture.type(large)', 'email', 'birthday', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link']
  },
  (accessToken, refreshToken, profile, cb) => {
    // const picture = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`
    // console.log(picture);
    
    return cb(null, profile)
  }));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: "58637867578-3mojbbdkg34v907s6ksi0ogjd7qbg5id.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, cb) {
    // const user = {
    //   googleId: profile.id,
    //   name: profile.displayName,
    //   email: profile.emails[0].value
    // };
    return cb(null, profile);
  }
));

// Serialize and deserialize user to support session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Session setup
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true, cookie: { maxAge: 1000 * 60 } }));
app.use(passport.initialize());
app.use(passport.session());

// Facebook authentication routes
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));
// app.get('/auth/facebook',
//     passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
//   );
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/dashboard');
    });

// Google authentication routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:3001/login' }),
    function(req, res) {
        res.redirect('http://localhost:3001/dashboard'); 
    }
);

// API route to get the authenticated user
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user._json);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Start the Express server on port 3000
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
