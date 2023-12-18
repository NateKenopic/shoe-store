import express from 'express';

const app = express();

import { getUsers, getUserByID, createUser } from './database.js';

app.get('/users', async (req, res) => {
    const users = await getUsers();
    if (!users) return res.status(500).send('Server error');
    res.json(users);
})

app.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = await getUserByID(id);
    if (!user) return res.status(500).send('Server error');
    res.json(user);
})

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something Broke!');
})

// error handler for 404 - not found
app.use((req, res) => {
    res.status(415).send('404 Not Found');
});

// make sure to call listen after all routes are defined
app.listen(8080, () => {
    console.log("Listening on port 8080");
});
