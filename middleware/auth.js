const jwt = require('jsonwebtoken');
 

module.exports = (req, res, next) => {
   try {
        // Extraction du token du header Authorization de la requête
        const token = req.headers.authorization.split(' ')[1];
      
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        // Extraction de l'ID de l'utilisateur qui est maintenant authentifié
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
	next();
   } catch(error) {
        res.status(401).json({ error });
   }
};