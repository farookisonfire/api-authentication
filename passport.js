const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./configuration');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
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

// GOOGLE OAUTH STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
  clientID: '25456979528-bgs6bgchgt98c8hi67culvi5nauflllm.apps.googleusercontent.com',
  clientSecret: 'EjY_jdGSr-BRkc6TziVDVI3n',
}, async(accessToken, refreshToken, profile, done) => {
  try {
    // check whether this current user exists in DB
    const existingUser = await User.findOne({ "google.id": profile.id })
    if (existingUser) {
      console.log('user exists in the db')
      return done(null, existingUser);
    }
  
    // if new account
    const newUser = new User({
      method: 'google',
      google: {
        id: profile.id,
        email: profile.emails[0].value
      }
    });
  
    await newUser.save();
    done(null, newUser);
  } catch(error) {
    done(error, false, error.message);
  }
}));

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    console.log('local strategy', password)
    // Find the user given the email
    const user = await User.findOne({ "local.email": email });
  
    // If not, handle it
    if (!user) {
      return done(null, false);
    }
  
    // Check if the password is correct
    const isMatch = await user.isValidPassword(password);
    
    // If not, handle it
    if (!isMatch) {
      return done(null, false);
    }
  
    // Otherwise, return the user
    done(null, user);
  } catch(error) {
    done(error, false);
  }
}));
