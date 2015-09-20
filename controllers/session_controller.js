// Middleware de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

//GET /login - Formulario de login
exports.new = function(req, res) {
  var errors = req.session.errors || {};
  req.session.errors = {};

  res.render('sessions/new', {errors: errors});
};

// POST /login - Crear la sesion
exports.create = function(req, res) {
  var login = req.body.login;
  var password = req.body.password;

  var userController = require('./user_controller');
  userController.autenticar(login, password, function(error, user) {
    if (error) { // si hay un error retornamos mensaje de error de sesion
      req.session.errors = [{"message": "Se ha producido un error: " + error}];
      res.redirect("/login");
      return;
    }

    //Crear req.session.user y guardar campos id y username
    // La sesion se define por la existencia de: req.session.user
    req.session.user = {id: user.id, username: user.username};

    // Creamos req.session.referenceTime para almacenar la hora del sistema
    req.session.referenceTime = new Date().getTime();
    // para disparar la alerta de desconexion al superar 2 min.
    req.session.autoLogout= false;

    res.redirect(req.session.redir.toString()); // redireccion al path anterior a login
  });
};

//DELETE /logout -- destruir sesion
exports.destroy = function(req, res) {
  delete req.session.user;
  if (req.session.autoLogout){  //controlamos si el valor ha cambiado a true en app.js
      res.redirect("/login");   //redireccionamos y mostramos mensaje de fin de sesion .
  }else{
      res.redirect(req.session.redir.toString()); // redireccion al path anterior a logout
       }
};