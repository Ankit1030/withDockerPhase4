const jwt = require('jsonwebtoken')


const payload = { userId: 123 };
const secretkey = 'This is my secxrettt keyy'

const verifyToken = async function (req, res, next) {
  console.log("Visited verifytoken------------------------------------------------------------------");

  const authHeader = req.headers.authorization;

  // Check if header is present and formatted correctly (Bearer <token>)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("VERIFYTOKEN ERROR");
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }
console.log("authHeader.split(' ')[1]",authHeader.split(' ')[1]);
  let token = authHeader.split(' ')[1];
  console.log('token-> 1199',token);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
jwt.verify(token,secretkey,(err,decode)=>{
  if (err) {
    if (err.name === 'JsonWebTokenError') {
        console.log("01",err);
        return res.status(401).json({ message: 'Forbidden: Invalid token' });
      } else if (err.name === 'TokenExpiredError') {
          console.log("02 ",err);
          return res.status(401).json({ message: 'Unauthorized: Token expired' });
        } else {
            // Handle other errors (e.g., unknown error)
            console.log('Error verifying token:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
  }else{
    console.log("decode -->",decode)
    if(payload.userId === decode.userId){ // verify that the rece token is equal to mtt sendd token 
      
      console.log("CORRECT RAAJU");
      next();
    }
   }      
})
}
module.exports = {verifyToken};