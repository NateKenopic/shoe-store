import mysql from 'mysql2';

import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}

export async function getShoes() {
    const [rows] = await pool.query("SELECT * FROM z_shoes");
    return rows;
}

export async function getUserByID(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE id = ?
    `, [id]);
    return rows[0];
}

export async function getUserByUsername(username) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE username = ?
    `, [username]);
    return rows[0];
}

export async function createUser(username, email, password, dateCreated) {
    try {
        const user = await getUserByUsername(username);
        if (user !== undefined) throw new Error('User already exists');

        const [result] = await pool.query(`
        insert into users (username, email, password, date_created) 
        values (?, ?, ?, ?);
        `, [username, email, password, dateCreated]);
        const insertedId = result.insertId;
        return await getUserByID(insertedId);
    } catch (e) {
        console.error(e.message);
        return [];
    }
}

export async function login(username, password) {
    try {
    const user = await getUserByUsername(username);
    if (user === undefined) throw new Error('User does not exist with this username');

    let canLogin = false;

    await bcrypt
      .compare(password, user.password)
      .then(res => {
        canLogin = res;
      })
      .catch(err => console.error(err.message))

    if (canLogin == true) {
        const [rows] = await pool.query(`CALL LOGIN_PRC(?, ?);`, [username, user.password]);

        console.log(username + ' has logged in successfully');

        return rows[0];
    } else {
        throw new Error('Could not login. Incorrect password for ' + username);
    }
    } catch (e) {
        console.error(e.message);
        return [];
    }
}