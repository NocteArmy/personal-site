var express = require('express');

var site = express();

site.set('port', process.env.PORT || 3000); 
site.set('view engine', 'ejs');
site.set('views', __dirname + '/views');

site.locals.siteTitle = 'Page Title'; //Page title to include on all pages

site.use(express.static(__dirname + '/public'));
site.use(require('./routes/index'));
site.use(require('./routes/resume'));

var server = site.listen(site.get('port'), function() {
    console.log('Listening on port ' + site.get('port'));
});