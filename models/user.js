/** User model */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    firstname: {
        type: String,
        required: [true, 'Your first name cannot be blank.'],
    },
    lastname: {
        type: String,
        required: [true, 'Your last name cannot be blank.'],
    },
    username: {
        type: String,
        minlength: [6, 'Your username must be at least six characters long.'],
        maxlength: [25, 'Your username is too long.'],
        required: [true, 'Your username cannot be blank.'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'You must have a valid email address.'],
        unique: true,
    },
    password: {
        type: String,
        select: false,
        minlength: [6, 'Your password must be a least six characters long.'],
        required: [true, 'Your password cannot be blank.'],
    },
    photo1: {
        type: String,
    },
    photo2: {
        type: String,
    },
    photo3: {
        type: String,
    },
    photo4: {
        type: String,
    },
});

// Must use function here! ES6 => functions do not bind this!
UserSchema.pre('save', function (next) {
    // Set createdAt and updatedAt
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }

    // Encrypt Password
    const user = this;
    if (!user.isModified ('password')) {
        return next ();
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
});

// Need to use function to enable this.password
UserSchema.methods.comparePassword = function(password, done) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        done(err, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
