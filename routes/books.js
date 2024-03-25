const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimiter = require("../middleware/rateLimiter");

const booksCtrl = require('../controllers/books')


router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getThreeBestRating);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', rateLimiter, auth, upload, upload.resizeImage, booksCtrl.createBook);
router.post('/:id/rating', rateLimiter, auth, booksCtrl.createRating);
router.put('/:id', rateLimiter, auth, upload, upload.resizeImage, booksCtrl.modifyBook);
router.delete('/:id', rateLimiter, auth, booksCtrl.deleteBook);

module.exports = router;