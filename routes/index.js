
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

    // app.post('/login', function(req, res, next){
    //     if(req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass'){
    //         req.session.authenticated = true;
    //         req.session.username = req.body.username;
    //         res.redirect('/welcome');
    //     }else {
    //         req.flash('error', 'Username and password are incorrect');
    //         res.redirect('/unauthorised');
    //     }
    // });

    app.post('/login', passport.authenticate('login', {
        successRedirect : '/welcome', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/welcome', function(req, res, next){

            res.render('welcome', {
                username : req.username
            });

    });
    app.get('/unauthorised', function(req, res, next){
             res.render('unauthorised');
        });


}
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}


