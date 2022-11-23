const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Queries = require("../queries");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (email, password, done) => {
  console.log(`The Password is ${password}`);
  try {
    const user = await Queries.getUserByEmail(email);
    if (!user) {
      return done("No User found", false);
    }
    if (password == "test123") {
      return done(null, user);
    } else {
      return done("Authentication Failed", false);
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

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await Queries.getUserById(userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
