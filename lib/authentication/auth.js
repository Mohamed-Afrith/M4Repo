const jwt = require("jsonwebtoken");

const generateToken = async (user) => {
  if (!user) return { error: 'User not found' };
  try {
    const token = jwt.sign({user}, process.env.PRIVATE_KEY, {
      algorithm: "HS512",
      expiresIn: "2d",
    });
    return token;
  } catch (err) {
    return { error: err.message };
  }
};

module.exports = { generateToken };