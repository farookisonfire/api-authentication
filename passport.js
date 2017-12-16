const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./configuration');
const User = require('./models/user');

// JSON WEB TOKENS STRATEGY
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: JWT_SECRET 
}, async (payload, done) => {
  try {
    // find the user specified in token
    const user = await User.findById(payload.sub);
    
    // if user doesnt exist, handle it
    if (!user) {
      return done(null, false);
    }

    // otherwise, return the user
    done(null, user);
  } catch(error) {
    done(error, false);
  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  // Find the user given the email
  const user = await User.findOne({email});

  // If not, handle it
  if (!user) {
    return done(null, false);
  }

  // Check if the password is correct

  // If not, handle it

  // Otherwise, return the user
}));
