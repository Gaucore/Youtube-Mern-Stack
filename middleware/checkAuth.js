const jwt=require('jsonwebtoken');

module.exports =async (req, res, next) => {
   try
   {
    const token=req.headers.authorization.split(' ')[1];
    await jwt.verify(token,process.env.SECRET_KEY);
    next();
   }
   catch(err)
   {
      return res.status(401).json({
          message:'Invalid Token',
      })
   }
};
