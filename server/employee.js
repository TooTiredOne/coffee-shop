const express = require('express');
const empRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timeshitRouter = require('./timesheet');

const checkRequiredFields = (req, res, next) => {
    const emp = req.body.employee;

    // check if all required fields present
    if(!emp.name || !emp.position || !emp.wage) {
        res.status(400).send();
    } else {
        next();
    }
};

// check if the employee with the given id exists
empRouter.param("employeeID", (req, res, next, id) => {
    try {
        const empID = Number(id); 
        db.get("SELECT * FROM Employee WHERE id=$empID",
        {
            $empID: empID
        },
        (err, row) => {
            if(err) {
                console.log(err);
                res.status(404).send(err);
            } else {
                if(row !== undefined) {
                    req.emp = row;
                    next();
                } else {
                    res.status(404).send(err);
                }
            }
        })
    } catch(err) {
        console.log(err);
        res.status(404).send(err);
    }

});

empRouter.use('/:employeeID/timesheets', timeshitRouter);

// send the list of all current employees
empRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee=1", (err, rows) => {
        if(err) {
            console.log(err)
            res.status(404).send(err);
        } else {
            res.status(200).send({
                employees: rows
            });
        }
        
    });
});

// adding new employee to the db
empRouter.post('/', checkRequiredFields, (req, res, next) => {

    const emp = req.body.employee;

    // inserting into db
    db.run("INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)",
    {
        $name: emp.name,
        $position: emp.position,
        $wage: emp.wage
    },
    function (err) {
        if(err) {
            console.log(err);
            res.status(400).send();
        } else {
            // acquiring newly inserted instance
            db.get("SELECT * FROM Employee WHERE id=$lastID",
            {
                $lastID: this.lastID
            },
            (err, row) => {
                if(err) {
                    console.log(err);
                    res.status(500).send();
                } else {
                    res.status(201).send({employee: row});
                }
            });
        } 
    });
    
});

empRouter.get('/:employeeID', (req, res, next) => {
    res.status(200).send({
        employee: req.emp
    });
});



empRouter.put('/:employeeID', checkRequiredFields, (req, res, next) => {
    const emp = req.body.employee;

    db.run("UPDATE Employee SET name=$name, position=$position, wage=$wage, is_current_employee=$isCurrentEmployee WHERE id=$curID",
    {
        $name: emp.name,
        $position: emp.position,
        $wage: emp.wage,
        $isCurrentEmployee: emp.isCurrentEmployee === 0? 0 : 1,
        $curID: req.emp.id
    },
    function(err) {
        if(err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            db.get("SELECT * FROM Employee WHERE id=$lastID",
            {
                $lastID: req.emp.id
            },
            (err, row) => {
                if(err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).send({employee: row});
                }
            });
        }
    });
});

empRouter.delete('/:employeeID', (req, res, next) => {
    const emp = req.emp;

    db.run("UPDATE Employee SET is_current_employee = 0 WHERE id=$curID",
    {
        $curID: req.emp.id
    },
    err => {
        if(err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            db.get("SELECT * FROM Employee WHERE id=$curID",
            {
                $curID: req.emp.id
            },
            (err, row) => {
                if(err) {
                    console.error(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).send({employee: row});
                }
            })
        }
    })
})

module.exports = empRouter;