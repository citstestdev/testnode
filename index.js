const express = require('express')
const app = express()
var path = require('path');
const helmet = require("helmet");
const fs = require("fs"); 
const  ejs = require('ejs')
var expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')



var indexRouter = require('./routes/index');



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(helmet());


// const urlencodedParser = bodyParser.urlencoded({ extended: false })
// app.use(bodyParser.json());



app.use(express.static('public'));
app.use(expressLayout);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




app.use('/', indexRouter);


app.get('/hello', function(req, res) {

    // res.send('Working!')
    res.send('working!');
  })
  
  app.listen(process.env.PORT || 5000)





module.exports = app;