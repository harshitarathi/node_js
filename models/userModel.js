const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    name :{
        type : String,
        //required : [true , 'please tell your name']
    },
    email :{
        type : String,
        //required : [true , 'please tell us your email id'],
        //unique : true,
        //lowercase : true,
        //validate : [validator.isEmail, 'pleaes provide a validate email']
    },
    photo : String,
    role:{
        type : String,
        enum: ['user','admin'],
        default: 'user'
    },
    password:{
        type : String,
        select : false
        //required : [true, 'please provide us a password'],
        //minlength : 8
    },
    confirmPassword:{
        type : String,
        //required : [true, 'please provide us a password']
        validate:{
            validator : function(el){
                return el === this.password;
            },
            message : "password not matched"
        }
    },
    passwordChangedAt : Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
} );


userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.confirmPassword = undefined;
    next();
  });

  userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
  userSchema.pre(/^find/, function(next){
    // this point to a current query
    this.find({active: {$ne: false}});
    next();

  });
  
  
  userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
  }

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/1000,
            10
        );
        console.log(this.changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
        return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 *1000;
    return resetToken;

} ;
const User = mongoose.model('User',userSchema);

module.exports = User;