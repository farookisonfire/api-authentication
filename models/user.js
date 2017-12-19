const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;


// create a schema
const userSchema = new Schema({
  method: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    required: true
  },
  local: {
    email: {
      type: String,
      lowercase: true
    },
    password: {
      type: String,
    }
  },
  google: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  
})

// define function to run before the specified mongoose method.
// in this case, we want to encrypt the password before we "save"
// a new user
userSchema.pre('save', async function(next) {
  // if the auth method of user is not local... next
  try {
    if(this.method !== 'local') {
      next();
    }
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Generate password hash (salt + hash)
    const passwordHash = await bcrypt.hash(this.local.password, salt);
    // Re-assign hashed version over original, plaintext password
    this.local.password = passwordHash
    next();
  } catch(error) {
    next(error);
  }
});


// Create a method on the userSchema object to compare user password
// from signin to the hashed password in db.
userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    // compare the plain-text pass with the hashed version
    return await bcrypt.compare(newPassword, this.local.password);
  } catch(error) {
    throw new Error(error);
  }
}

// create a model
const User = mongoose.model('user', userSchema);

// export the model
module.exports = User;
