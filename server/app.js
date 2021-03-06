const express = require('express');
const multer = require('multer');
// const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();
const fileModel = require('../models/fileModel');
// Middleware runs before the request is passed to the route functions
dotenv.config();
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log('Error in Connection to DB');
    } else {
        console.log('DB Connected');
    }
});

// Adding Middleware
const storage = multer.diskStorage({
    destination: path.join(__dirname + '/uploads'),
    filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return callback(err);
            console.log(raw);
            console.log(raw.toString('hex'));
            callback(null, raw.toString('hex'), path.extname(file.originalname));
        });
    }
});
const upload = multer({ storage });
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../index.html'));
// });
app.post('/profile', upload.array('avatar', 2), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    const host = req.host;
    // const filePath = req.protocol + "://" + host + '/' + req.file.path;
    const files = new fileModel({
        file: {}
    });
    req.files.forEach((file, index) => {
        fs.readFile(file.path, null, (err, data) => {
            if (err) {
                console.log('Error while reading data from file ' + err);
            }
            files.file.fileData.push(data);
            files.file.contentType.push(file.mimetype);
            if (index === req.files.length - 1) {
                console.log(files);
                saveFiles(files, res);
            }
        });
    });
});
app.get('/uploads', (req, res) => {
    const encodedImages = [];
    fileModel.find({ "file.contentType": { $elemMatch: { $regex: /image/, $options: 'i' } } }, 
    { _id:0,"file.contentType.$": 1,"file.fileData":1 }, (err, result) => {
        if (err) {
            console.log('Error while querying files');
            return res.send('Error while querying ' + err);
        }
        // console.log(result[0].file.contentType.length +' '+result[0].file.fileData.length);
        result.forEach(({ file }, index) => {
            encodedImages.push(...file.fileData);
        });
        console.log('Length of Encoded Images is '+encodedImages.length);
        return res.send(encodedImages);
    })
});
function saveFiles(files, res) {
    files.save(function (err, files) {
        if (err) {
            console.log('Error while saving ' + err);
            return res.send('Error While Saving');
        } else {
            return res.send('Successfull');
        }
    });
}
app.listen(3000, () => console.log('App is listening on port 3000'));