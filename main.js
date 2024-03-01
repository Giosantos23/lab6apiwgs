import express from "express";
import {getAllPosts, getpostID, uppost,deletePost} from './db.js'; 
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cors from "cors";
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


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
app.get("/posts", async (request, response) => {
    try {
        const posts = await getAllPosts()
        response.json(posts)
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
app.get("/posts/:idpost", async (request, response) => {
    const id = request.params.idpost
    try {
        const posts = await getpostID(id)
        response.json(posts)
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

app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        response.status(400).json({ message: 'Formato incorrecto en el body de la solicitud' });
    } else {
        next();
    }
});

app.get("/posts/:idpost", async (request, response) => {
    const id = request.params.idpost
    try {
        const posts = await uppost(id)
        response.json(posts)
    } catch (error) {
        console.error('Error al update del post:', error);
        response.status(500).json({ message: 'Error al update del post' });
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
  const { title, content } = request.body;

  try {
    const result = await createPost(title, content);
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
    const postId = request.params.postId;
  
    try {
      await deletePost(postId);
      response.json({ message: 'Post eliminado exitosamente' });
    } catch (error) {
      console.error('Error al borrar el post:', error);
      response.status(500).json({ message: 'Error al borrar el post' });
    }
  });

app.use((request, response, next) => {
    response.status(501).json({ message: 'Metodo no implementado' });
  });

app.use((request, response) => {
    response.status(404).json({ message: 'Endpoint no encontrado' });
});

app.listen(port, () => console.log(`corriendo en el ${port}`));


