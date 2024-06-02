// server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://admin:asdasd123@cluster0.xssefom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', function() {
  console.log('Conexión exitosa a MongoDB');
});


const usuarioSchema = new mongoose.Schema({
  email: String,
  nombre: String,
  apellidos: String,
  telefono: String,
  contrasena: String,
  fechaRegistro: { type: Date, default: Date.now } 
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const directorioRaiz = path.join(__dirname, '');
app.use(express.static(directorioRaiz));
app.use('/images', express.static(path.join(directorioRaiz, 'images')));
app.use('/css', express.static(path.join(directorioRaiz, 'css')));
// Middleware para manejar páginas no encontradas (404)


const generateAuthToken = (userId) => {
  const token = jwt.sign({ userId   }, 'secret_key', { expiresIn: '24d' });
  return token;
};

const verifyAuthToken = (token) => {
  try {
      const decodedToken = jwt.verify(token, 'secret_key');
      console.log('Decoded Token:', decodedToken); 
      return decodedToken;
  } catch (error) {
      return null;
  }
};

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
      const decodedToken = verifyAuthToken(token);

      if (decodedToken) {
          req.userId = decodedToken.userId;
          next();
      } else {
          res.redirect('/iniciosesion.html');
      }
  } else {
      res.redirect('/iniciosesion.html');
  }
};

app.get('/verificar-sesion', (req, res) => {
 
    if (req.cookies.userId) {
        
        res.status(200).send('Usuario autenticado');
    } else {
      
        res.status(401).send('Usuario no autenticado');
    }
  });
  const verificarSesion = (req, res) => {
    if (req.cookies.userId) {
        res.status(200).send('Usuario autenticado');
    } else {
        res.status(401).send('Usuario no autenticado');
    }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Inicio.html'));
});
app.get('/obtener-nombre-usuario', async (req, res) => {
    try {
     
        const userId = req.cookies.userId;
        
        if (userId) {
           
            const usuario = await Usuario.findById(userId);
            if (usuario) {
              
                res.status(200).json({ nombre: usuario.nombre , apellidos: usuario.apellidos , telefono: usuario.telefono, email : usuario.email });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado.' });
            }
        } else {
            res.status(401).json({ message: 'Usuario no autenticado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/cerrar-sesion', (req, res) => {
 
  res.clearCookie('jwt');
  res.clearCookie('userId');
  res.clearCookie('userInfo');
  

 
  res.redirect('/Inicio.html');
});

app.post('/registrarse.html', async (req, res) => {
  const { email, nombre, apellidos, telefono, contrasena } = req.body;
  try {
    const nuevoUsuario = new Usuario({
      email: req.body.email,
      nombre: req.body.nombre,
      apellidos: req.body.apellidos,
      telefono: req.body.telefono,
      contrasena: req.body.contrasena,
      fechaRegistro: new Date()
    });
    
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).send('El email ya está en uso');
    }
    await nuevoUsuario.save();
  
    res.redirect("/iniciosesion.html")
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar usuario');
  }
});

app.post('/login', async (req, res) => {
    try {
      const { email, contrasena } = req.body;
  
      const usuario = await Usuario.findOne({ email });
  
      if (usuario && usuario.contrasena === contrasena) {
        const token = generateAuthToken(usuario._id);
  
        // Establecer token JWT en la cookie
        res.cookie('jwt', token, { httpOnly: true });
        
        // Establecer ID de usuario en la cookie
        res.cookie('userId', usuario._id.toString(), { httpOnly: true });
  
        // Pasar la información del usuario como un objeto JSON en una sola cookie
        res.cookie('userInfo', JSON.stringify({
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          telefono: usuario.telefono,
          email: usuario.email
        }), { httpOnly: true });
        
        res.redirect("/micuenta.html"); 
  
      } else {
        res.status(401).json({ message: 'Email o contraseña incorrectos.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al iniciar sesión');
    }
  });

app.post('/verificar-email', async (req, res) => {
  try {
      console.log("Solicitud de verificación de email recibida");
      const { email } = req.body;
      console.log("Email recibido:", email);

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
          console.log("El email ya está en uso");
          return res.status(400).send('El email ya está en uso');
      } else {
          console.log("El email está disponible");
          return res.status(200).send('El email está disponible');
      }
  } catch (error) {
      console.error("Error al verificar el email:", error);
      return res.status(500).send('Error interno del servidor al verificar el email');
  }
});
app.post('/actualizar-perfil', requireAuth, async (req, res) => {
    const userId = req.userId;

    // Verificar si el usuario existe en la base de datos
    try {
        const usuario = await Usuario.findById(userId);

        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }

        // El usuario existe, actualizar el perfil
        const { nombre, apellidos, email, telefono } = req.body;

        
        if (nombre) usuario.nombre = nombre;
        if (apellidos) usuario.apellidos = apellidos;
        if (email) usuario.email = email;
        if (telefono) usuario.telefono = telefono;

       
        await usuario.save();

        res.status(200).send('Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).send('Error interno del servidor al actualizar el perfil');
    }
});
  


app.post('/cambiar-contrasena', requireAuth, async (req, res) => {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
  
    let passwordMatch; 
  
    try {
 
      const usuario = await Usuario.findById(userId);
  
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
  
      if (!currentPassword) {
        return res.status(400).json({ error: 'Debe proporcionar la contraseña actual' });
      }
 
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden' });
      } 
      if(currentPassword !== usuario.contrasena){
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      } else {
      
   
      usuario.contrasena = newPassword;
      await usuario.save();
  
    
      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }

  });
  



const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const options = {
  auth: {
    api_key: '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'
  }
};

const transporter = nodemailer.createTransport(sgTransport(options));

const enviarCorreo = async (opciones) => {
  try {
    await transporter.sendMail(opciones);
    console.log('Correo electrónico enviado correctamente');
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
  }
};

app.set('views', path.join(__dirname, 'views'));


app.get('/restablecer-contrasena', async (req, res) => {
  const { token } = req.query;

  try {
  
    const decodedToken = jwt.verify(token, 'token_secreto_para_restablecer_contraseña');
    const userId = decodedToken.userId;

  
    res.render('restablecer-contrasena', { token: token }); 

  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(400).send('El token es inválido o ha expirado');
  }
});
app.post('/restablecer-contrasena1', async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {

    const decodedToken = jwt.verify(token, 'token_secreto_para_restablecer_contraseña');


    const userId = decodedToken.userId;


    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    
    usuario.contrasena = nuevaContrasena;
    await usuario.save();

    res.status(200).send('Contraseña actualizada correctamente');
  } catch (error) {
    console.error('Error al procesar la solicitud de restablecimiento de contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.post('/restablecer-contrasena', async (req, res) => {
    const { email } = req.body;
  
    try {
     
      const usuario = await Usuario.findOne({ email });
  
      if (!usuario) {
        return res.status(404).json({ error: 'El correo electrónico no está registrado' });
      }
  
      const token = jwt.sign({ userId: usuario._id }, 'token_secreto_para_restablecer_contraseña', { expiresIn: '1h' });

 
      const mailOptions = {
        from: 'ferreteriamontiel53@gmail.com',
        to: email, 
        subject: 'Recuperación de Contraseña',
       text: `Hola ${usuario.nombre},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n\nferreteria-montiel.fly.dev/restablecer-contrasena?token=${token}\n\nEste enlace expirará en 1 hora. Si no solicitaste un restablecimiento de contraseña, ignora este correo electrónico.\n\nSaludos,\nFerreteria Montiel`
 };
  
      await enviarCorreo(mailOptions); 
  
      res.status(200).send('Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña');
    } catch (error) {
      console.error('Error al procesar la solicitud de recuperación de contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});