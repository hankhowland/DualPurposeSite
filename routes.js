const express = require('express');
const router = express.Router();
const assert = require('assert');

// main page 
router.get('/', async function(req, res, next){
    //dates
    var prevMonday = getPreviousMonday();
    new Date(prevMonday);
    var nextMonday = new Date();
    nextMonday.setDate(prevMonday.getDate() + 7);
    nextMonday.setHours(-8,0,0,0);

    //get runs
    const db = req.app.locals.db;
    var runsArray = [];
    var runsCursor = db.collection('runs').find({"date" : { $gte : prevMonday, $lt : nextMonday}}).sort({date: 1});
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

    //chart weekly mileage totals
    var totalsCursor = db.collection('runs').find().sort({date: -1});
    const totalsArray = []
    await totalsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        totalsArray.push(doc);
    });
    const weeklyMileage = []; //weekly mileage for chart
    const weeklyMileageDates = []; //weeks ago for chart
    weeklyMileage.push(total_miles);
    weeklyMileageDates.push(0);
    var currTotal = 0;
    for (var i=1; i<6; i++) {
        currTotal = 0;
        nextMonday.setDate(nextMonday.getDate() -6);
        prevMonday.setDate(prevMonday.getDate() -6);
        nextMonday.setHours(-8,0,0,0);
        prevMonday.setHours(-8,0,0,0);
        totalsArray.forEach((run) => {
            if ((run.date >= prevMonday) && (run.date <= nextMonday) ) {
                console.log(run.date);
                console.log(run.distance);
                currTotal += Number(run.distance);
            }
        })
        weeklyMileage.push(currTotal);
        weeklyMileageDates.push(i);
    }
    weeklyMileage.reverse();
    weeklyMileageDates.reverse();


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
      
    
    res.render('index', {items: runsArray, juul: juulArray, med:medArray, st:stArray, totalMiles: total_miles,
        today: todayString, weeklyMileage: weeklyMileage, mileageX: weeklyMileageDates});
});

//training plan page
router.get('/trainingPlan', async function(req, res, next) {
    var prevMonday = getPreviousMonday();
    new Date(prevMonday);
    var sunday = new Date()
    sunday.setDate(prevMonday.getDate() + 6)
    
    const db = req.app.locals.db;
    var runsCursor = db.collection('plannedRuns').find({"date" : { $gte : prevMonday, $lte : sunday}}).sort({date: 1});
    const runsArray = []
    await runsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        doc.date = doc.date.toISOString().split('T')[0]
        runsArray.push(doc);
    }); 

    var restRunsCursor = db.collection('plannedRuns').find({"date" : { $gt : sunday}}).sort({date: 1});
    const restRunsArray = []
    await restRunsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        doc.date = doc.date.toISOString().split('T')[0]
        restRunsArray.push(doc);
    }); 

    
    res.render('trainingPlan', {runs: runsArray, restRuns: restRunsArray});

});

//runs archive
router.get('/archive', async function(req, res, next) {
    const db = req.app.locals.db;
    var runsCursor = db.collection('runs').find().sort({date: -1});
    const runsArray = []
    await runsCursor.forEach(function(doc, err) {
        assert.equal(null, err);
        doc.date = doc.date.toISOString().split('T')[0]
        runsArray.push(doc);
    }); 
    res.render('archive', {items: runsArray})
})

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

//add run to training plan 
router.route('/addPlannedRun')
    .post(function(req, res, next) {
        const db = req.app.locals.db;
        const item = {
            date: new Date(req.body.Date),
            description: req.body.Desc
        }

        db.collection('plannedRuns').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('item inserted');
        });

        res.redirect('/routes/trainingPlan');
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



/////utility functions
function getPreviousMonday()
{
    var date = new Date();
    var day = date.getDay();
    var prevMonday = new Date();
    if(date.getDay() == 0){
        prevMonday.setDate(date.getDate());
    }
    else{
        prevMonday.setDate(date.getDate() - (day-1));
    }
    prevMonday.setHours(-8, 0, 0,0);

    return prevMonday;
}