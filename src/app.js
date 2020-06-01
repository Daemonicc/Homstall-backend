/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { resolve } = require('path');
const { multerUploads, dataUri } = require('./middlewares/multer');
const { cloudinaryConfig, uploader } = require('./config/cloudinaryConfig');
const errorHandler = require('./middlewares/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({});

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoute');
const products = require('./routes/ProductRoute');

const app = express();


app.set('views', path.join(__dirname, 'public'));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());


// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(resolve(__dirname, 'public')));

app.use('*', cloudinaryConfig);
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);

app.get('/', (req, res) => {
  res.render('index.html');
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
