const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllAssets)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createAsset
  );

router
  .route('/:id')
  .get(tourController.getAsset)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateAsset
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteAsset
  );

module.exports = router;
