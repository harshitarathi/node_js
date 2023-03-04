const path = require('path');
const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize= require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp= require('hpp');

const tourRouter = require('./Routes/tourRoute');
const userRouter = require('./Routes/userRoute');
const viewRouter = require('./Routes/viewRoute');

const app = express();
app.use(express.json());
app.use('/api/v1/assets', tourRouter);
app.use('/api/v1/users', userRouter);

app.set('view engine', 'pug');
app.set('views' , path.join(__dirname, '/views'));

// 1) global MIDDLEWARES
//serving static file
app.use(express.static(path.join(__dirname, '/public')));

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'Too many request from this Ip ...Try again in an Hour!'
});
app.use('/api', limiter);


//Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));

//Data sanitization against nosql query language
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist: ['duration' ]
}));

//serving static file

//test middleware
app.use((req, res, next ) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);

    next();
});

//3)router
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/asset', tourRouter);

module.exports = app;

