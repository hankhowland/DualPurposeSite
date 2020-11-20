const express = require('express');
const router = express.Router();
const assert = require('assert');

// main page 
router.get('/', async function(req, res, next){
    //get runs
    const db = req.app.locals.db;
    var runsArray = [];
    var runsCursor = db.collection('runs').find();
    var hoursArray = [];
    var hoursCursor = db.collection('hours').find();
    var juulCursor = db.collection('counts').find({type:"juul"});
    var juulArray = [];
    var medCursor = db.collection('counts').find({type:"meditation"});
    var medArray = [];
    var stCursor = db.collection('counts').find({type:"screentime"});
    var stArray = [];
    await runsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        runsArray.push(doc);
    }); 
    await hoursCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        hoursArray.push(doc);
    });
    await juulCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        juulArray.push(doc);
    }); 
    await medCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        medArray.push(doc);
    }); 
    await stCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        stArray.push(doc);
    }); 
    
      
    
    res.render('index', {items: runsArray, hours: hoursArray, juul: juulArray, med:medArray, st:stArray});
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


// counting routes
router.get('/incrementJuul', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'juul'}, { $inc: {count: 1}}, function(err, result) {
        assert.equal(null, err);
        console.log('days without juul incremented');
    });
    res.redirect('/routes/');
})

router.get('/resetJuul', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'juul'}, { $set: {count: 0}}, function(err, result) {
        assert.equal(null, err);
        console.log('days without juul reset to zero');
    });
    res.redirect('/routes/');
})

router.get('/incrementMed', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'meditation'}, { $inc: {count: 1}}, function(err, result) {
        assert.equal(null, err);
        console.log('days meditating incremented');
    });
    res.redirect('/routes/');
})

router.get('/resetMed', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'meditation'}, { $set: {count: 0}}, function(err, result) {
        assert.equal(null, err);
        console.log('days meditating reset to zero');
    });
    res.redirect('/routes/');
})

router.get('/incrementST', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'screentime'}, { $inc: {count: 1}}, function(err, result) {
        assert.equal(null, err);
        console.log('days with screentime < 3 hours incremented');
    });
    res.redirect('/routes/');
})

router.get('/resetST', async function(req, res, next) {
    const db = req.app.locals.db;
    db.collection('counts').update({type: 'screentime'}, { $set: {count: 0}}, function(err, result) {
        assert.equal(null, err);
        console.log('days with screentime < 3 hours reset to zero');
    });
    res.redirect('/routes/');
})



module.exports = router;