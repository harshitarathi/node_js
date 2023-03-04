const Asset = require('../models/assetModule');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync (async(req,res) => {
    //1) Get asset from data collection
    const assets = await Asset.findOne({slug: req.param.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
   //2)build template

    //3)Rener that template using tour data from 1)


       res.status(200).render('overview' , {
        title: 'All Tours',
        assets
    });
});

exports.getAsset = catchAsync(async(req,res,next) => {
    //1)Get the data, for the requested asset
    const asset = await Asset.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
      });


    
      if (!asset) {
        return next(new AppError('There is no tour with that name.', 404));
      }
    
      // 2) Build template
      // 3) Render template using data from 1)
      res.status(200).render('asset', {
        title: `${asset.name} Asset`,
        asset
      });
    });
    

exports.getLoginForm = (req , res) => {
    res.status(200).render('login' , {
        title: 'Log into your account'
    });
};
