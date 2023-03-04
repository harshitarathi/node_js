const Asset = require('./../models/assetModule');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllAssets = catchAsync(async (req, res) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Asset.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const assets = await features.query;

    // SEND RESPONSE
    res.status(200).json({assetstatus: 'success',
      results: assets.length,
      data: {
        assets
      }
    });
  });

exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        asset
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createAsset = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newAsset = await Asset.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        asset: newAsset
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        asset
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
