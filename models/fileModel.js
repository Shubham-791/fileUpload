const { Schema, model } = require('mongoose');

const fileSchema = new Schema({
    file: new Schema({
        contentType: [String],
        fileData: [Buffer]
    })
});

module.exports = model('fileModel', fileSchema);