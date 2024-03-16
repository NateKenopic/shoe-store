import mysql from 'mysql2';

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

export async function getUserByID(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE id = ?
    `, [id]);
    return rows[0];
}

export async function createUser(username, email, password, dateCreated) {
    const [result] = await pool.query(`
    insert into users (username, email, password, date_created) 
    values (?, ?, ?, ?);
    `, [username, email, password, dateCreated]);
    const insertedId = result.insertId;
    return await getUserByID(insertedId);
}

export async function login(username, password) {
    const [rows] = await pool.query(`
CALL LOGIN_PRC(?, ?);
    `, [username, password]);

    return rows[0];
}