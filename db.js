import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import conn from './conn.js'


export async function getAllPosts() {
 const [rows] = await conn.query('SELECT * FROM blog_posts')
 return rows
}

export async function createPost(title, content, created_at, movie_title, release_date, director, genre) {
  const [result] = await conn.query('INSERT INTO blog_posts (title, content, created_at, movie_title, release_date, director, genre) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, content, created_at, movie_title, release_date, director, genre]);
  return result;
}

export async function deletePost(postId) {
    await conn.query('DELETE FROM blog_posts WHERE id = ?', [postId]);
  }

export async function getpostID(id) {
 const [rows] = await conn.query('SELECT * FROM blog_posts WHERE id = ?',[id])
 return rows
}

export async function uppost(id, title, content, created_at, movie_title, release_date, director, genre) {
  const [rows] = await conn.query('UPDATE blog_posts SET title = ?, content = ?, created_at = ?, movie_title = ?, release_date = ?, director = ?, genre = ? WHERE id = ?', [title, content, created_at, movie_title, release_date, director, genre, id]);
  return rows;
}

// Función para obtener un usuario por nombre de usuario
export async function getUserByUsername(username) {
  const [rows] = await conn.query('SELECT * FROM users WHERE user = ?', [username]);
  return rows[0];
}

export async function createUser(username, password) {
  const [result] = await conn.query('INSERT INTO users (user, password) VALUES (?, ?)', [username, password]);
  return result;
}

export async function verUser(username) {
  const [rows] = await conn.query('SELECT * FROM users WHERE user = ?', [username]);
  return rows;
}
