const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { username, password } = req.body;
  
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'roofing2026!';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET || 'wantace_intern_secret',
      { expiresIn: '8h' }
    );
    
    return res.status(200).json({ token });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
};

module.exports = { login };