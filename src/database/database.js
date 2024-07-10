// import mysql from 'mysql2';
const mysql = require('mysql2');

// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

async function getUsers() {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
}

async function getShoes() {
  const [rows] = await pool.query('SELECT * FROM z_shoes');
  return rows;
}

async function getUserByID(id) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM users
    WHERE id = ?
    `,
    [id]
  );
  return rows[0];
}

async function getUserByUsername(username) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM users
    WHERE username = ?
    `,
    [username]
  );
  return rows[0];
}

async function createUser(username, email, password, dateCreated) {
  try {
    const user = await getUserByUsername(username);
    if (user !== undefined) throw new Error('User already exists');

    const [result] = await pool.query(
      `
        insert into users (username, email, password, date_created) 
        values (?, ?, ?, ?);
        `,
      [username, email, password, dateCreated]
    );
    const insertedId = result.insertId;
    return await getUserByID(insertedId);
  } catch (e) {
    console.error(e.message);
    return [];
  }
}

async function login(username, password) {
  try {
    const user = await getUserByUsername(username);
    if (user === undefined) throw new Error('User does not exist with this username');

    let canLogin = false;

    await bcrypt
      .compare(password, user.password)
      .then((res) => {
        canLogin = res;
      })
      .catch((err) => console.error(err.message));

    if (canLogin == true) {
      const [rows] = await pool.query(`CALL LOGIN_PRC(?, ?);`, [username, user.password]);

      return rows[0];
    } else {
      throw new Error('Could not login. Incorrect password for ' + username);
    }
  } catch (e) {
    console.error(e.message);
    return [];
  }
}

module.exports = {
  getUsers,
  getUserByID,
  getUserByUsername,
  getShoes,
  login,
  createUser,
};
