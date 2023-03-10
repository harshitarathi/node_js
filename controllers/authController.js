const {promisify} = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email.js');
const crypto = require('crypto');

const signToken = id =>{
  return jwt.sign({id}, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000
  ),
  httpOnly: true
};
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt',token, cookieOptions);

  // remove the password from output
  user.password = undefined

  res.status(statusCode).json({
    status:"success",
    token,
    data:{
      user
    }
  });
}
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  
  createSendToken(newUser, 201, res );
});

exports.login = catchAsync(async(req, res, next) =>{
  //reading data from body
  const {email, password} = req.body;
    
  //1) check if email and apssword exist
  if(!email || !password){
    next(new AppError('please provide email and password!',400));
  }

  //2)check if user exist and password is correct
  const user = await User.findOne({email}).select('+password');
    if(!user || !await user.correctPassword(password, user.password)){
    return next(new AppError('incorrect email or password', 401));
  }
    
  //3)if everything ok, send token to client
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check of it's there
  let token;
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ){
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt){
    token = req.cookies.jwt;
  }

  if(!token){
    return next(new AppError('you are not logged in! please log in to get access.', 401))
  };

  console.log(token);
  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  console.log(decoded);
  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if(!currentUser){
    return next(new AppError('The token belonging to this user does no longer exist.', 401
    ));
  }
  //4)check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError('user recently changed the password please login again', 401));
}
//grant access to protected route
req.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async(req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};


exports.restrictTo = (...roles) =>{
  return (req, res, next) =>{
  //roles is an array ....roles=['admin']
    if(!roles.includes(req.user.role)){
      return next(new AppError('you do not have permission to perform this action',403));
    }
    next();
  };
} ;

exports.forgotPassword = catchAsync (async(req, res, next) => {
  //1) Get user based on posted email
  const user = await User.findOne({email: req.body.email })
  if(!user) {
    return next ( new AppError('There is no user with email address.',404));
  }
  //2)generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false});
  
  //3)send it to user's mail
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `forgot your password? submit a patch request with your new password and password confirm to : ${resetURL}.\nIf you did not forget your password, please ignore this email`;
try{
  
  await sendEmail({
    email: user.email,
    subject: "your password reset token is valid for 10 min",
    message
  });

  res.status(200).json({
    status: 'success',
    message: 'token sent to email'
  });
} catch(err){
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({validateBeforeSave: false});

  return next(new AppError('there was an error sending the email. try again later! '),500);
}
});
 exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if(!user){
    return next(new AppError('token is invalid or has expired',400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
 
  //3)update changedPasswordAt property for the user

  
  //4) log the user in, send JWT
  createSendToken(user, 200, res);
 });

exports.updatePassword = catchAsync(async(req,res,next) => {
  //1)Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  
  //2) Check if POsted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('password is not correct',401))
  }

  //3) If so , update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //4) Log user, send  JWT
  createSendToken(user, 200, res);
});