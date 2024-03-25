
const bcrypt = require('bcrypt');
const User = require('../models/user');
require ('dotenv').config();
const jwt = require('jsonwebtoken');

// Regex pour les formats d'emails et de mots de passe
const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;



// POST => Création de compte
exports.signup = (req, res, next) => {

    if (!emailRegex.test(req.body.email)) {
        return res.status(410).json({message:"Email non conforme"})
    }
    
    if(!passwordRegex.test(req.body.password)){
        return res.status(410).json({message: "Le mot de passe doit contenir au moins 8 catactères, dont une majuscule et un chiffre"})
    }


    // Appel de la fonction de hachage de bcrypt dans le MDP (qui est "salé" 10 fois) A voir si variable env pour le nombre de rounds (10)??
    bcrypt.hash(req.body.password, 10)

      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

// POST => Connexion
exports.login = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur/Mot de passe incorrect!' });
            }
            
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Utilisateur/Mot de passe incorrect!' });
                    }
                    
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.SECRET_TOKEN,
                            { expiresIn: '6h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
