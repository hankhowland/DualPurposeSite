const express = require('express');
const router = express.Router();
const assert = require('assert');

// main page 
router.get('/', async function(req, res, next){
    //get runs
    const db = req.app.locals.db;
    var runsArray = [];
    var runsCursor = db.collection('runs').find().sort({date: -1});
    var hoursArray = [];
    var hoursCursor = db.collection('hours').find().sort({date: -1});
    var juulCursor = db.collection('counts').find({type:"juul"});
    var juulArray = [];
    var medCursor = db.collection('counts').find({type:"meditation"});
    var medArray = [];
    var stCursor = db.collection('counts').find({type:"screentime"});
    var stArray = [];
    await runsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        doc.date = doc.date.toISOString().split('T')[0]
        runsArray.push(doc);
    }); 

    await hoursCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        doc.date = doc.date.toISOString().split('T')[0]
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

    // total miles
    var total_miles = 0;
    runsArray.forEach((run) => {
        total_miles += parseFloat(run.distance);
    });

    //total hours
    var total_hours = 0;
    hoursArray.forEach((hour) => {
        total_hours += parseFloat(hour.hours);
    });
    //today's date
    let options = {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }
    const today = new Date().toLocaleString([], options);
    var todayString = today.split(',')[0]
    var todayString = todayString.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3-$1-$2");
    
      
    
    res.render('index', {items: runsArray, hours: hoursArray, juul: juulArray, med:medArray, st:stArray, totalMiles: total_miles, totalHours: total_hours,
        today: todayString});
});

//add run from form action
router.route('/addrun')
    .post(function(req, res, next) {
        const db = req.app.locals.db;
        const item = {
            distance: req.body.runDistance,
            date: new Date(req.body.runDate),
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
            date: new Date(req.body.date),
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