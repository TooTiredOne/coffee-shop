const express = require('express');
const menuItemRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const checkRequired = (req, res, next) => {
    const item = req.body.menuItem;

    if(!item.name || !item.inventory || !item.price) {
        res.sendStatus(400);
    } else {
        next();
    }
}

menuItemRouter.param('menuItemID', (req, res, next, id) => {
    try {
        const itemID = Number(id);
        db.get("SELECT * FROM MenuItem WHERE id=$id",
        {
            $id: itemID
        }, 
        (err, row) => {
            if(err) {
                next(err);
            } else {
                if(row) {
                    req.item = row;
                    next();
                } else {
                    res.status(404).send();
                }
            }
        });
    } catch(err) {
        res.status(404).send();
    }
});

menuItemRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE menu_id=$id",
    {
        $id: req.menu.id
    },
    (err, rows) => {
        if(err) {
            next(err);
        } else {
            if(rows) {
                res.status(200).send({menuItems: rows});
            } else {
                res.status(200).send({menuItems: []});
            }
            
        }
    });
});

menuItemRouter.post('/', checkRequired, (req, res, next) => {
    const item = req.body.menuItem;

    db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)",
    {
        $name: item.name, 
        $description: item.description, 
        $inventory: item.inventory, 
        $price: item.price, 
        $menu_id: req.menu.id
    }, 
    function(err) {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM MenuItem WHERE id=$id",
            {
                $id: this.lastID
            },
            (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).send({menuItem: row});
                }
            })
        }
    })
})

menuItemRouter.put('/:menuItemID', checkRequired, (req, res, next) => {
    const item = req.body.menuItem;
    
    db.run("UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price, menu_id=$menu_id",
    {
        $name: item.name, 
        $description: item.description, 
        $inventory: item.inventory, 
        $price: item.price, 
        $menu_id: req.menu.id
    },
    err => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM MenuItem WHERE id=$id", 
            {
                $id: req.item.id
            },
            (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).send({menuItem: row});
                }
            });
        }
    });
});

menuItemRouter.delete('/:menuItemID', (req, res, next) => {
    db.run("DELETE FROM MenuItem WHERE id=$id",
    {
        $id: req.item.id
    },
    err => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});



module.exports = menuItemRouter;