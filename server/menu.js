const express = require('express');
const menuRouter = express.Router();
const menuItemRouter = require('./menu-item');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const checkRequired = (req, res, next) => {
    const menu = req.body.menu;
    if(!menu.title) {
        res.status(400).send();
    } else {
        next();
    }
}

const checkHasItems = (req, res, next) => {
    const menu = req.menu;
    db.get("SELECT * FROM MenuItem WHERE menu_id=$id",
    {
        $id: menu.id
    },
    (err, row) => {
        if(err) {
            next(err);
        } else {
            if(row) {
                res.status(400).send();
            } else {
                next();
            }
        }
    })
}

menuRouter.param('menuID', (req, res, next, id) => {
    try {
        const menuID = Number(id);
        db.get("SELECT * FROM Menu WHERE id=$id",
        {
            $id: menuID
        },
        (err, row) => {
            if(err) {
                next(err);
            } else {
                if(row) {
                    req.menu = row;
                    next();
                } else {
                    res.status(404).send();
                }
            }
        });
    } catch (err) {
        res.status(404).send(err);
    }
})

menuRouter.use('/:menuID/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu", (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({menus: rows});
        }
    });
});

menuRouter.post('/', checkRequired, (req, res, next) => {
    const menu = req.body.menu;
    db.run("INSERT INTO Menu (title) VALUES ($title)",
    {
        $title: menu.title
    },
    function(err) {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Menu WHERE id=$id",
            {
                $id: this.lastID
            },
            (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).send({menu: row});
                }
            });
        }
    });
});

menuRouter.get('/:menuID', (req, res, next) => {
    res.status(200).send({menu: req.menu});
});

menuRouter.put('/:menuID', checkRequired, (req, res, next) => {
    db.run("UPDATE Menu SET title=$title WHERE id=$id",
    {
        $id: req.menu.id,
        $title: req.body.menu.title
    },
    (err) => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Menu WHERE id=$id",
            {
                $id: req.menu.id
            },
            (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).send({menu: row});
                }
            });
        }
    });
});

menuRouter.delete('/:menuID', checkHasItems, (req, res, next) => {
    const menu = req.menu;
    db.run("DELETE FROM Menu WHERE id=$id",
    {
        $id: menu.id
    },
    (err) => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})


module.exports = menuRouter;