var express = require('express');
var router = express.Router();

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('members', { title: 'members' });
}); */


router.get('/', isAuthenticated, function(req, res){
  res.render('members', {title: 'members'});
})

function isAuthenticated(req, res, next){

  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');
}



module.exports = router;