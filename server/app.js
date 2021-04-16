const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, '-') +
                '-' +
                file.originalname
        );
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(helmet());
app.use(compression());

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

app.get('/', (req, res) => {
    res.send('Hello from REST API of DISHEN');
});

const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rlpkk.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true`;
const PORT = process.env.PORT || 8000;

mongoose
    .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(PORT);
    })
    .catch((err) => console.log(err.message));

mongoose.set('useFindAndModify', false);
