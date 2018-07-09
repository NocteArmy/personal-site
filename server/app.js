const express = require('express');
const path = require('path');

const app = express();

app.set('port', process.env.PORT || 3000); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.siteTitle = 'Page Title'; //Page title to include on all pages

app.use(express.static(path.join(__dirname, '../client')));
app.use(require('./routes/index'));
app.use(require('./routes/resume'));

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
});