require('dotenv').config();
const express = require('express');
const massive = require('massive');
const bcryptjs = require('bcryptjs');

const app = express();

app.use(express.json());


massive({
    connectionString: process.env.CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
}).then((dbInstance) => {
    app.set('db', dbInstance);
    console.log('Database Connected!');
});

const favPlanets = ['Mars', 'Pluto'];

app.post('/api/register', (req, res) => {
    const{
        username,
        password,
        email,
        firstName
    } = req.body
    const db = req.app.get('db');
    //check to make sure required values were passed
    if (username && password && email) {
        db
            .auth
            .check_for_username(username)
            .then((count) => {
                const newCount = +count[0].count;
                if(newCount > 0) {
                    res.status(500).json('Username is unavailable')
                }
                else {
                    const hash = bcryptjs.hashSync(password);
                    db 
                        .auth
                        .register_user({ username, password: hash, email, firstName })
                        .then(() => {
                            res.sendStatus(200);
                        })
                }
            })
    }
    else {
        res.status(400).json("Please provide a valid username, password, and email")
    }
});



app.listen(5050, () => console.log(`Listening on Port 5050`));