const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../configuration');

const signToken = (user) => {
  return JWT.sign({
    iss: 'CodeWorkr',
    sub: user._id,
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day
  }, JWT_SECRET);
}

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;

    // Check if there is a user with the same email
    const foundUser = await User.findOne({ email });
    if (foundUser) { 
      return res.status(409).json({ error: 'Email is already in use' }) 
    }

    // Create a new user
    const newUser = new User({ email, password });
    await newUser.save();
    
    // Generate the token
    const token = signToken(newUser);
    
    // Respond with token
    res.status(200).json({ token });
    

  },

  signIn: async (req, res, next) => {
  },

  secret: async (req, res, next) => {
    console.log('i got here!!')
    res.json({ secret: "resource" });
  }
}