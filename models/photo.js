const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    name: {
        type: String,
        require: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    urlString: {
        type: String,
        required: true,
    },
    base64String: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Photo', PhotoSchema);
