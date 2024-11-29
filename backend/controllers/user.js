const bcrypt = require ('bcrypt');
const User = require ('../models/User');
const jwt = require('jsonwebtoken');

// fonction pour enregister des utilisateurs
exports.signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // fonction pour hasher le mot de pase, 10 tours c'est ok car plus l'enregistrement sera plus lent
    .then(hash => {
      const user = new User({    // créer un nouveau user avec ce mot de passe crypté
        email: req.body.email,
        password: hash
      });
      user.save()  // foction pour enregistrer cet utilisateur dans la base des données
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// fonction pour connecter des utilisateurs
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
         if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                 if (!valid) {
                     return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                 }
                res.status(200).json({
                     userId: user._id,
                     token: jwt.sign(
                         { userId: user._id },
                         'RANDOM_TOKEN_SECRET',
                         { expiresIn: '24h' }
                     )
                 });
             })
             .catch(error => res.status(500).json({ error }));
     })
     .catch(error => res.status(500).json({ error }));
 };
