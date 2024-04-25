const GoogleStratergy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const User = require('./models/userModel');
const createNewUser = async (profile) => {
  const user = await new User({
    googleId: profile.id,
    email: profile.email,
    fName: profile.displayName,
    verified: true,
    isAdmin: false,
  });
  const createdUser = await user.save();
  return createdUser;
};

passport.use(
  new GoogleStratergy(
    {
      clientID: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile, callback) {
      callback(null, profile);

      console.log(profile);
      try {
        const { email } = profile;
        const userExists = await User.findOne({ email });
        if (userExists) {
          throw new Error();
        } else {
          createNewUser(profile);
        }
      } catch (error) {
        console.log('user already exists', error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
