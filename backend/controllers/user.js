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
// exports.login = (req, res, next) => {
//     User.findOne({ email: req.body.email })
//     .then(user => {
//         if (!user) {
//             return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
//         }
//         bcrypt.compare(req.body.password, user.password)
//             .then(valid => {
//                 if (!valid) {
//                     return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
//                 }
//                 res.status(200).json({
//                     userId: user._id,
//                     token: jwt.sign(
//                         { userId: user._id },
//                         'RANDOM_TOKEN_SECRET',
//                         { expiresIn: '24h' }
//                     )
//                 });
//             })
//             .catch(error => res.status(500).json({ error }));
//     })
//     .catch(error => res.status(500).json({ error }));
// };

exports.login = (req, res, next) => {
    // Log initial pour voir si la requête arrive bien dans la fonction
    console.log("Début de la fonction login");

    // Log pour vérifier les données reçues dans la requête
    console.log("Requête reçue :", req.body);

    User.findOne({ email: req.body.email })
        .then(user => {
            // Vérifie si un utilisateur correspondant a été trouvé
            if (!user) {
                console.log("Aucun utilisateur trouvé pour cet email :", req.body.email);
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }

            // Log pour indiquer qu'un utilisateur a été trouvé
            console.log("Utilisateur trouvé :", user);

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Vérifie si le mot de passe est valide
                    if (!valid) {
                        console.log("Mot de passe incorrect pour l'utilisateur :", user.email);
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }

                    // Log pour indiquer que l'utilisateur est authentifié
                    console.log("Authentification réussie pour l'utilisateur :", user.email);

                    const token = jwt.sign(
                        { userId: user._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                    );

                    // Log pour afficher le token généré
                    console.log("Token généré :", token);

                    res.status(200).json({
                        userId: user._id,
                        token: token
                    });
                })
                .catch(error => {
                    console.error("Erreur lors de la comparaison des mots de passe :", error);
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            // Log pour toute erreur survenant pendant la recherche de l'utilisateur
            console.error("Erreur lors de la recherche de l'utilisateur :", error);
            res.status(500).json({ error });
        });
};