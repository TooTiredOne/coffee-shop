const express = require('express');
const timeshitRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const checkRequired = (req, res, next) => {
    const ts = req.body.timesheet;   
    if(!ts.hours || !ts.rate || !ts.date) {
        res.status(400).send();
    } else {
        next();
    }
}

timeshitRouter.param('timesheetID', (req, res, next, tsID) => {
    try {
        const id = Number(tsID);
        db.get("SELECT * FROM Timesheet WHERE id=$id",
        {
            $id:id
        },
        (err, row) => {
            if(err) {
                next(err);
            } else {
                if(row !== undefined) {
                    req.timeshit = row;
                    next();
                } else {
                    res.status(404).send();
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(404).send();
    }
})

timeshitRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Timesheet WHERE employee_id=$curID',
    {
        $curID: req.emp.id
    },
    (err, rows) => {
        if(err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            res.status(200).send({timesheets: rows});
        }
    });
});

timeshitRouter.post('/', checkRequired, (req, res, next) => {
    const ts = req.body.timesheet;

    db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $empID)",
    {
        $hours: ts.hours,
        $date: ts.date,
        $rate: ts.rate,
        $empID: req.emp.id
    },
    function(err) {
        if(err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            db.get("SELECT * FROM Timesheet WHERE id=$lastID",
            {
                $lastID: this.lastID
            },
            (err, row) => {
                if(err) {
                    console.error(err);
                    res.status(500).send(err);
                } else {
                    res.status(201).send({timesheet: row});
                }
            });
        }
    });
});

timeshitRouter.put('/:timesheetID', checkRequired, (req, res, next) => {
    const ts = req.body.timesheet;
    
    db.run("UPDATE Timesheet SET hours=$hours, date=$date, rate=$rate WHERE id=$curID",
    {
        $hours: ts.hours,
        $rate: ts.rate,
        $date: ts.date,
        $curID: req.timeshit.id
    },
    err => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Timesheet WHERE id=$curID",
            {
                $curID: req.timeshit.id
            },
            (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).send({timesheet: row});
                }
            })
        }
    })
})

timeshitRouter.delete('/:timesheetID', (req, res, next) => {
    db.run('DELETE FROM Timesheet WHERE id=$id',
    {
        $id: req.timeshit.id
    },
    err => {
        if(err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = timeshitRouter;