const fs = require('fs');
const sharp = require('sharp');
const User = require('../models/User');
const Book = require('../models/Book');

// Récupération des tous les livres depuis la base de données
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(500).json({ error }));
};

// Récupération d'un livre selon les paramètres id
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Récupération des trois livres le mieux notés
exports.getBestRatingBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: - 1 }).limit(3);
    res.status(200).json(books);

  } catch (error) {
    res.status(500).json({ error });
  }
};

// Création d'un nouveau livre
exports.createBook = (req, res) => {
  try {
    const bookObjet = JSON.parse(req.body.book);
    delete bookObjet._id;
    delete bookObjet._userId;

    const email = bookObjet.email;
    const userId = req.auth.userId
    const user = User.findById(userId);

    if (user && user.email === email) {
      const book = new Book({
        ...bookObjet,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      });

      sharp(req.file.path)
        .webp({ quality: 80 })
        .toFile(`images/${req.file.filename.split('.')[0]}.webp`, (error) => {
          if (error) {
            return res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
          };

          book.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}.webp`;
        });

      book.save()
        .then(() => res.status(201).json({ message: 'Livre crée avec succès !' }))
    } else {
      return res.status(400).json({ message: "L'email ne correspond pas à l'utilisateur connecté." });
    }

  } catch (error) {
    console.error('Erreur de traitement des données :', error);
    res.status(400).json({ message: 'Erreur lors de la création du livre.', error });
  }
};

// Modification des champs/image d'un livre
exports.modifyBook = (req, res) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// L'ajout d'une notation et mise à jour de la note moyenne d'un livre
exports.PostRating = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    const rating = req.body.rating;
    id = req.params.id;

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    const newRating = { userId: req.auth.userId, grade: req.body.rating }
    book.ratings.push(newRating);

    const average = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length;
    book.averageRating = average;

    await book.save();
    res.status(200).json(book);

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la note' });
  }
};

// Supréssion d'un livre de la base de données
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};
