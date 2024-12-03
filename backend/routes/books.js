// créer le router
const express = require ('express');
const auth = require ('../middleware/auth');
const multer = require ('../middleware/multer-config');
const router = express.Router();
const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get ('/bestrating', booksCtrl.getBestRatingBooks);
router.post ('/', auth, multer, booksCtrl.createBook);
router.post ('/:id/rating', auth, booksCtrl.PostRating);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;