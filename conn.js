import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'gio22523',
    database: 'peliculas2024',
    password: 'Nslqvpm6'


})

export default pool