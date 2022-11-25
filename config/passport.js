const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Queries = require("../queries");
const bcrypt = require("bcrypt");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (email, password, done) => {
  try {
    const user = await Queries.getUserByEmail(email);
    if (!user) {
      return done("No User found", false);
    }

    if (await bcrypt.compare(password, user.password)) {
      return done(null, user); // done(err,user,info)
    } else {
      return done(null, false, "Authentication Failed. Please try again.");
    }
  } catch (err) {
    return done(err);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (user_id, done) => {
  try {
    const user = await Queries.getUserById(user_id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
