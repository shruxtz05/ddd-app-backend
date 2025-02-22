import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import jwksClient from "jwks-rsa";

// Extending Request Type to Include Auth0 ID and User ID
declare module "express-serve-static-core" {
  interface Request {
      auth0Id?: string;
      userId?: string;
  }
}

export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// Fetch Auth0 public key dynamically
const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
});

const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid!, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};




export const jwtParse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const { authorization } = req.headers;

      if (!authorization || !authorization.startsWith("Bearer ")) {
          res.status(401).json({ message: "Unauthorized: No token provided" });
          return; // ✅ Ensures function stops execution
      }

      const token = authorization.split(" ")[1];

      // Decode the token
      const decoded = jwt.decode(token) as jwt.JwtPayload | null;
      if (!decoded || !decoded.sub) {
          res.status(401).json({ message: "Unauthorized: Invalid token" });
          return;
      }

      const auth0Id = decoded.sub;

      // Find user in database
      const user = await User.findOne({ auth0Id });
      if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
      }

      // Attach user data to request
      req.auth0Id = auth0Id;
      req.userId = user._id.toString();

      next(); // ✅ Calls next() only when everything is valid
  } catch (error) {
      console.error("JWT Parse Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};
