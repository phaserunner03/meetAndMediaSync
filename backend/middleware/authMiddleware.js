const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {

    let token = req.header('authToken');
    if (!token) {
      token = req.cookies?.token; // Read from HTTP-only cookie
    }
    if(!token){
      return res.status(401).json({ message: 'Unauthorized'} );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ googleId: decoded.uid });
    if (!user) {
      return res.status(401).json({ message: 'User not found'});
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const restrictToAdmin = (req,res,next)=>{
  try{
  if(req.user.role!=='admin'){
    return res.status(403).json({message:'Access denied: Admins only'});
  }
  next();
}
catch(err){
  res.status(500).json({message:err.message});

}
}


module.exports = {authMiddleware, restrictToAdmin};