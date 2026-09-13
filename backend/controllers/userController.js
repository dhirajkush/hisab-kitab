import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID, createHash, timingSafeEqual } from "crypto";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const createAccessToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

const createRefreshToken = (user) => {
  // jti guarantees a unique token per issuance, even if issued within the same second
  return jwt.sign({ id: user._id, jti: randomUUID() }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
};

// refresh tokens are already high-entropy (signed JWTs), so a fast full-length
// hash is the right tool here - bcrypt truncates input at 72 bytes, which is a
// problem since tokens for the same user share an identical header+id prefix
// well past that limit.
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const tokensMatch = (hashA, hashB) => {
  if (!hashA || !hashB) return false;
  const bufA = Buffer.from(hashA, "hex");
  const bufB = Buffer.from(hashB, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

// issues a fresh access + refresh token pair, persisting a hash of the refresh token
const issueTokens = async (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic || "",
});

//register user

export async function registerUser(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  try {
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const { accessToken, refreshToken } = await issueTokens(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: accessToken,
      refreshToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// to login user

export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google Sign-In. Please log in with Google.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

//to get the user login

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// to update a user profile

export async function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name || !email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "valid email and name are required",
    });
  }

  try {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true },
    );
    res.json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// to change user  password

export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "password invalid or too short. ",
    });
  }
  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found. ",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In and has no password to change.",
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({
      success: true,
      message: "password changed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// to sign in / sign up with a Google ID token
export async function googleAuth(req, res) {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      message: "Google Sign-In is not configured on the server",
    });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // an account with this email already exists (registered normally) - link it
        user.googleId = googleId;
        if (!user.profilePic) user.profilePic = picture || "";
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          profilePic: picture || "",
        });
      }
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(401).json({
      success: false,
      message: "Google sign-in failed",
    });
  }
}

// to exchange a valid refresh token for a new access + refresh token pair
export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id).select("+refreshTokenHash");
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const match = tokensMatch(hashToken(refreshToken), user.refreshTokenHash);
    if (!match) {
      // presented token doesn't match the last issued one (reuse/theft) - revoke it
      user.refreshTokenHash = null;
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);
    res.json({
      success: true,
      token: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Refresh token invalid or expired",
    });
  }
}

// to log out and revoke the current refresh token
export async function logoutUser(req, res) {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// to update the profile picture
export async function updateProfilePic(req, res) {
  const { profilePic } = req.body;
  if (!profilePic || typeof profilePic !== "string") {
    return res.status(400).json({
      success: false,
      message: "A profile picture is required",
    });
  }
  if (profilePic.length > 3_000_000) {
    return res.status(400).json({
      success: false,
      message: "Image is too large. Please use a smaller picture.",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic },
      { new: true },
    );
    res.json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
