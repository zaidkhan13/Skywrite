import jwt from "jsonwebtoken";
// Importing 'dotenv' to load environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables from the .env.local file (if present)
dotenv.config({ path: ".env.local" });

// Retrieving the secret key used to verify JWT from environment variables
const secret = process.env.JWT_SECRET;

// Middleware function to authenticate users using a JWT
const fetchUser = (req, res, next) => {
  
  // Retrieve the token from the 'auth-token' header of the request
  const token = req.header("auth-token");
  
  // If no token is found in the request header, return an error response with status 401 (Unauthorized)
  if (!token) {
    return res.status(401).send({ error: "Please authenticate using valid token!" });
  }

  try {
    // Verify the token using the secret key; if valid, decode the token and get the user data
    const data = jwt.verify(token, secret);

    // Attach the user data to the request object (so other middleware or routes can access the user info)
    req.user = data.user;

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or verification fails, return an error response with status 401 (Unauthorized)
    res.status(401).send({ error: "Please authenticate using valid token!" });
  }
};

// Export the middleware 
export default fetchUser;
