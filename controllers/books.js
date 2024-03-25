const Book = require('../models/book');
const average = require('../utils/average');
const fs = require('fs');



///////////////////////////////////////////////
/// ***** LOGIQUE METIER REQUETES GET *****////
///////////////////////////////////////////////


exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getThreeBestRating = (req, res, next) => {

    Book.find().sort({ averageRating: -1 }).limit(3)
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(404).json({ error }));
};


///////////////////////////////////////////////
/// ***** LOGIQUE METIER REQUETES POST *****///
///////////////////////////////////////////////


exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    // Suppression du faux _id envoyé par le front
    delete bookObject._id;
    // Suppression de _userId pour la sécurité, être sûr que l'userId sera bien celui d'un utilisateur enregistré  => "userId: req.auth.userId,"
    delete bookObject._userId;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
        averageRating: bookObject.ratings[0].grade
    });
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};



exports.createRating = (req, res, next) => {

    if (0 <= req.body.rating <= 5) {
        const ratingObject = { ...req.body, grade: req.body.rating };

        delete ratingObject._id;

        Book.findOne({ _id: req.params.id })
            .then(book => {
                // Tableau regroupant tous les userId ayant déjà noté le livre
                const newRatings = book.ratings;
                const userIdArray = newRatings.map(rating => rating.userId);
                // On empêche une seconde notation du livre par le même user
                if (userIdArray.includes(req.auth.userId)) {
                    res.status(403).json({ message: 'Not authorized' });

                } else {

                    // Ajout de la nouvelle note au tableau et calcul de la moyenne
                    newRatings.push(ratingObject);
                    const grades = newRatings.map(rating => rating.grade);
                    const averageGrades = average.average(grades);
                    book.averageRating = averageGrades;

                    // MAJ de la note du livre et moyenne des notes
                    Book.updateOne({ _id: req.params.id }, { ratings: newRatings, averageRating: averageGrades, _id: req.params.id })
                        .then(() => { res.status(201).json() })
                        .catch(error => { res.status(400).json({ error }) });
                    res.status(200).json(book);
                }
            })
            .catch((error) => {
                res.status(404).json({ error });
            });
    } else {
        res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
    }
};


///////////////////////////////////////////////
/// ***** LOGIQUE METIER REQUETES PUT *****////
///////////////////////////////////////////////



// PUT => Modification d'un livre existant
exports.modifyBook = (req, res, next) => {

    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    } : { ...req.body };

    // Suppression de _userId auquel on ne peut faire confiance
    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {

            // Le livre ne peut être mis à jour que par le créateur de sa fiche
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            } else {
                // Séparation du nom du fichier image existant
                const filename = book.imageUrl.split('/images/')[1];
                // Si l'image a été modifiée, on supprime l'ancienne
                req.file && fs.unlink(`images/${filename}`, (err => {
                    if (err) console.log(err);
                })
                );

                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => {
            res.status(404).json({ error });
        });
};


///////////////////////////////////////////////
/// ***** LOGIQUE METIER REQUETES DELETE *****/
///////////////////////////////////////////////


// DELETE => Suppression d'un livre
exports.deleteBook = (req, res, next) => {

    Book.findOne({ _id: req.params.id })
        .then(book => {

            // Le livre ne peut être supprimé que par le créateur de sa fiche
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            } else {
                // Séparation du nom du fichier image
                const filename = book.imageUrl.split('/images/')[1];
                // Suppression du fichier image puis suppression du livre dans la base de données dans la callback
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(404).json({ error });
        });
};





