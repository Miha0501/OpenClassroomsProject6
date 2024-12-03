const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

exports.getAllBooks = (req, res, next) => { // récupération des livres pour être envoyés dans la base des données
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRatingBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: - 1 }).limit(3);
    res.status(200).json(books);

  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
  try {
    const bookObjet = JSON.parse(req.body.book); // Récupérer les données JSON du champ "book" (envoyées avec multipart/form-data)
    delete bookObjet._id;
    delete bookObjet._userId;

    const book = new Book({
      ...bookObjet,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sharp(req.file.path)
      .webp({ quality: 80 })
      .toFile(`images/${req.file.filename.split('.')[0]}.webp`, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
        };

        book.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}.webp`;
      });

    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré avec succès !' }))
      .catch(error => {
        console.error('Erreur lors de la sauvegarde du livre :', error);
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error('Erreur de traitement des données :', error);
    res.status(400).json({ message: 'Erreur lors de la création du livre.', error });
  }
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
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

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
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