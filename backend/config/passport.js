import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google email is unavailable"));
        }

        let user = await userModel.findOne({
          $or: [
            {
              provider: "google",
              providerId: profile.id
            },
            {
              email: email.toLowerCase()
            }
          ]
        });

        if (!user) {
          user = await userModel.create({
            name: profile.displayName,
            email: email.toLowerCase(),
            provider: "google",
            providerId: profile.id,
            role: "customer",
            cartData: {}
          });
        } else if (
          user.provider === "local" &&
          !user.providerId
        ) {
          user.providerId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;