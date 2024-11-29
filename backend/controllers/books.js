const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => { // récupération des livres pour être envoyés dans la base des données
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(500).json({ error }));
  };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  };

exports.createBook = (req, res, next) => { // création des nouvelles livres selon le schéma défini avec mongoose
    delete req.body._id;
    const book = new Book ({
      ...req.body
    })
    book.save()
    .then (() => res.status (201).json ({ message: 'Livre enregistré !'}))
    .catch (error => res.status (400).json ({error}))
  };

exports.modifyBook = (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Livre modifié !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
      .catch(error => res.status(400).json({ error }));
  };

