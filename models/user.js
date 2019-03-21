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
        minlength: [2, 'Your username must be longer than six characters.'],
        required: [true, 'Your username must be longer than six characters.'],
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
        required: [true, 'Your password cannot be blank.'],
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
