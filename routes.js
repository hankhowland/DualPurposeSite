const express = require('express');
const router = express.Router();
const assert = require('assert');

// routes/
router.get('/', async function(req, res, next){
    //get runs
    const db = req.app.locals.db;
    var runsArray = [];
    var runsCursor = db.collection('runs').find();
    var hoursArray = [];
    var hoursCursor = db.collection('hours').find();
    await runsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        runsArray.push(doc);
    }); 
    await hoursCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        hoursArray.push(doc);
    });
    res.render('index', {items: runsArray, hours: hoursArray});
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

//add programming hours from form 
router.route('/addhours')
    .post(function(req, res, next) {
        const db = req.app.locals.db;
        console.log(req.body);
        const item = {
            date: req.body.date,
            hours: req.body.hours,
            notes: req.body.notes
        }

        db.collection('hours').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('item inserted');
        });

        res.redirect('/routes/');
});
module.exports = router;