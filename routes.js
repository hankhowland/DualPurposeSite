const express = require('express');
const router = express.Router();
const assert = require('assert');

// routes/
router.get('/', async function(req, res, next){
    //get runs
    const db = req.app.locals.db;
    var runsArray = [];
    var cursor = db.collection('runs').find();
    cursor.forEach(function(doc, err) {
        assert.equal(null, err);
        resultArray.push(doc);
    }, function() {
        res.render('index', {items: runsArray});
    });
});

//add run from form action
router.route('/addrun')
    .post(function(req, res, next) {
        const db = req.app.locals.db;
        console.log(req.body);
        const item = {
            distance: req.body.runDistance,
            date: req.body.runDate,
            title: req.body.runTitle,
            notes: req.body.runNotes
        }

        db.collection('runs').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('item inserted');
        });

        res.redirect('/routes/');
});

module.exports = router;