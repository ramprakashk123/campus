import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as HTTP-Only cookie (optional, but we will send it in JSON response for standard APIs too)
  // For standard MERN apps we can rely on Bearer token in headers. 
  // We'll return it so the frontend can store it.
  return token;
};

export default generateToken;
