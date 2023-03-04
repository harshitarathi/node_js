const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
//const User = require('./userModel');
const assetSchema = new mongoose.Schema(
  {
    name : {
      type : String,
      required : true
    },
    description : String,
   startLocation : {
    //geoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
   },
   locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ]
});

 // DOCUMENT MIDDLEWARE: runs before .save() and .create()
assetSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

assetSchema.pre('save' , async function(next){
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

    const Asset = mongoose.model('Asset', assetSchema);
    module.exports = Asset;