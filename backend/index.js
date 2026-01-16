// backend/index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = 3000;

// ====== MIDDLEWARES ======
app.use(cors());
app.use(express.json());

// carpeta estática para imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====== MULTER (subida de imágenes) ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ====== AUTH MIDDLEWARE (BEARER TOKEN) ======
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; 
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET || 'secreto', (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = payload; // { id, username }
    next();
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' });
});

//USUARIOS
//Registro 
app.post('/api/users', upload.single('profile_image'), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImage = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El email ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, profile_image) VALUES (?, ?, ?, ?)',
      [username, email, hash, profileImage]
    );

    res.status(201).json({
      message: 'Usuario creado correctamente',
      id: result.insertId,
      profile_image: profileImage,
    });
  } catch (e) {
    console.error('Error al crear usuario:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//LOGIN 
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secreto',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login correcto',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_image: user.profile_image,
      },
      token,
    });
  } catch (e) {
    console.error('Error login:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//usuarios por username 
app.get('/api/users/search', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.json([]);

    const [rows] = await pool.query(
      'SELECT id, username, profile_image FROM users WHERE username LIKE ? ORDER BY username LIMIT 10',
      [`${username}%`]
    );

    res.json(rows);
  } catch (e) {
    console.error('Error buscando usuarios:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener un usuario
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await pool.query(
      'SELECT id, username, email, profile_image, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error('Error obteniendo usuario:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Reseñas de un usuario
app.get('/api/users/:id/reviews', async (req, res) => {
  try {
    const userId = req.params.id;
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const [rows] = await pool.query(
      `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.image_url,
        r.created_at,
        b.title AS book_title
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ?
      ORDER BY r.rating ${order}, r.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (e) {
    console.error('Error obteniendo reseñas de usuario:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//LIBROS
// Libros + Media
app.get('/api/books', async (req, res) => {
  try {
    const { title, author } = req.query;

    let sql = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.description,
        b.cover_url,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS review_count
      FROM books b
      LEFT JOIN reviews r ON r.book_id = b.id
    `;
    const params = [];
    const conditions = [];

    if (title) {
      conditions.push('b.title LIKE ?');
      params.push(`%${title}%`);
    }

    if (author && author !== 'Todos') {
      conditions.push('b.author = ?');
      params.push(author);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY b.id ORDER BY b.title ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('Error listando libros:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Lista de autores
app.get('/api/books/authors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT author FROM books ORDER BY author');
    res.json(rows);
  } catch (e) {
    console.error('Error listando autores:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

//RESEÑAS
app.post('/api/reviews', authenticateToken, upload.single('book_image'), async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bookId || rating === undefined || rating === null) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      return res.status(400).json({ error: 'Rating debe estar entre 0 y 10' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    await pool.query(
      `
      INSERT INTO reviews (book_id, user_id, rating, comment, image_url)
      VALUES (?, ?, ?, ?, ?)
      `,
      [bookId, userId, ratingNum, comment || null, imageUrl]
    );

    res.status(201).json({ message: 'Reseña guardada correctamente' });
  } catch (e) {
    console.error('Error guardando reseña:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar reseña 
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      return res.status(400).json({ error: 'Rating debe estar entre 0 y 10' });
    }

    const [result] = await pool.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
      [ratingNum, comment || null, reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta reseña' });
    }

    res.json({ message: 'Reseña actualizada correctamente' });
  } catch (e) {
    console.error('Error actualizando reseña:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar reseña
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta reseña' });
    }

    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (e) {
    console.error('Error eliminando reseña:', e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend en http://0.0.0.0:${PORT}`);
});
