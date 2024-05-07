import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  getAllPosts, getpostID, uppost, deletePost, createPost,
  getUserByUsername, createUser,verUser,
} from './db.js';
import { hashear, comparar } from './security.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const secretKey = '1234';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de peliculas',
      version: '1.0.0',
      description: 'Documentación con Swagger',
    },
  },
  apis: ['./main.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

/**
 * @swagger
 * /posts:
 *   get:
 *     description: trae todos los posts
 *     responses:
 *       200:
 *         description: Retorna todos los posts
 */
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    response.status(400).json({ message: 'Formato incorrecto en el body de la solicitud' });
  } else {
    next();
  }
});
const verifyToken = (request, response, next) => {
  const token = request.headers.authorization;

  if (!token) {
    return response.status(401).json({ message: 'Token de autorización no proporcionado' });
  }

  // Verificar el token JWT
  jwt.verify(token.split(' ')[1], secretKey, (error, decoded) => {
    if (error) {
      return response.status(401).json({ message: 'Token de autorización inválido' });
    }

    // Si el token es válido, pasar al siguiente middleware
    request.userId = decoded.userId;
    next();
  });
};

// Endpoint para el login
app.post('/login', async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return response.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
    }

    const passwordMatch = await comparar(password, user.password);
    if (!passwordMatch) {
      return response.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    response.json({ token });
  } catch (error) {
    console.error('Error al autenticar el usuario:', error);
    response.status(500).json({ message: 'Error al autenticar el usuario' });
  }
});

app.get('/posts', async (request, response) => {
  try {
    const posts = await getAllPosts();
    response.json(posts);
  } catch (error) {
    console.error('Error al traer el post:', error);
    response.status(500).json({ message: 'Error al traer el post' });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obtener un post por su ID
 *     description: Retorna un post específico basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del post a obtener
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retorna el post especificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: No se encontró ningún post con el ID especificado
 *       500:
 *         description: Error interno del servidor al intentar obtener el post
 */
app.get('/posts/:idpost', async (request, response) => {
  const id = request.params.idpost;
  try {
    const posts = await getpostID(id);
    if (!posts) {
      return response.status(404).json({ message: 'Post no encontrado' });
    }
  } catch (error) {
    console.error('Error al traer el post:', error);
    response.status(500).json({ message: 'Error al traer el post' });
  }
});

/**
 * @swagger
 * /posts/{idpost}:
 *   put:
 *     summary: Actualiza un post por su ID
 *     description: Actualiza un post específico utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: idpost
 *         description: ID del post a actualizar
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK. Se ha actualizado el post exitosamente.
 *       '404':
 *         description: No se encontró el post con el ID proporcionado.
 *       '500':
 *         description: Error al actualizar el post.
 */

app.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const {
    title, content, created_at, movie_title, release_date, director, genre,
  } = req.body;

  try {
    const result = await uppost(postId, title, content, created_at, movie_title, release_date, director, genre);
    res.status(200).json({ message: 'Post actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    res.status(500).json({ message: 'Error al actualizar el post' });
  }
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Crear un nuevo post
 *     description: Crea un nuevo post con el título y contenido proporcionados en el cuerpo de la solicitud.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: El título del post
 *               content:
 *                 type: string
 *                 description: El contenido del post
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                 postId:
 *                   type: integer
 *                   description: ID del post creado
 *       500:
 *         description: Error interno del servidor al intentar crear el post
 */
app.post('/posts', async (request, response) => {
  const {
    title, content, created_at, movie_title, release_date, director, genre,
  } = request.body;

  try {
    const result = await createPost(title, content, created_at, movie_title, release_date, director, genre);
    response.status(201).json({ message: 'Post creado exitosamente', postId: result.insertId });
  } catch (error) {
    console.error('Error al crear el post:', error);
    response.status(500).json({ message: 'Error al crear el post' });
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Eliminar un post por su ID
 *     description: Elimina un post específico basado en su ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID del post a eliminar
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post eliminado exitosamente
 *       500:
 *         description: Error interno del servidor al intentar eliminar el post
 */
app.delete('/posts/:postId', async (request, response) => {
  const { postId } = request.params;

  try {
    await deletePost(postId);
    response.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    console.error('Error al borrar el post:', error);
    response.status(500).json({ message: 'Error al borrar el post' });
  }
});

app.post('/register', async (request, response)=>{
  const { username } = request.body;
  const { password } = request.body;
  const hash = hashear(password);
  try {
    await createUser(username,hash);
    response.status(200).json({ message: 'Se registro correctamente' });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: 'Se registro incorrectamente' });
  }
});

app.post('/register', async (request, response) => {
  const { username, password } = request.body;

  try {
    const users = await verUser(username);

    if (users.length > 0) {
      return response.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: 'Error' });
  }
});

// Middleware para manejar métodos no implementados
app.use((request, response, next) => {
  response.status(501).json({ message: 'Método no implementado' });
});

// Middleware para manejar rutas no encontradas
app.use((request, response, next) => {
  response.status(404).json({ message: 'Endpoint no encontrado' });
});

app.listen(port, () => console.log(`corriendo en el ${port}`));
