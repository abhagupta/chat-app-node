var Messages  = require('../models/messages');

module.exports =  function (app, passport) {
   // app.get('/', function(req, res, next){
   //      res.render('index');
   // });

    app.get('/signup', function(req, res, next){
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup',  passport.authenticate('signup', {
        successRedirect : '/welcome', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/login', function(req, res, next){
        res.render('login', { message: req.flash('loginMessage') });
    })


    app.post('/login', passport.authenticate('login', {
        successRedirect : '/welcome', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/welcome', function(req, res, next){
        if(!req.session.passport){
            res.redirect('/unauthorised');
        } else {
            res.render('welcome', {
                username : req.user.username
            });
        }



    });
    app.get('/unauthorised', function(req, res, next){
             res.render('unauthorised');
        });

    app.get('/retrieveMessagesForRoom', function(req, res, next){

        Messages.find({"room": req.query.room}, function(err, data){
            res.setHeader('Content-Type', 'application/json');
            res.send( data);

        });

    });
    app.get('/logout', function(req, res){
        req.logout();
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            }

            // destroy session data
            req.session = null;

            // redirect to homepage
            res.redirect('/login');
        });

    })


}
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}


