import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductStockNotificationController from '../controllers/ProductStockNotificationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const productStockNotificationRoutes = (): Router => {
  const productStockNotificationRouter = express.Router()

  productStockNotificationRouter.use('/product-stock-notifications', checkAuth, checkUserIsVerifiedStatus, ProductStockNotificationController.setModule)
  productStockNotificationRouter.use('/product-stock-notifications/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductStockNotificationController.checkRecord))
  productStockNotificationRouter.route('/product-stock-notifications/:id')
    .put(asyncHandler(ProductStockNotificationController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.BODY]: validator.validateProductStockNotification
      }), asyncHandler(ProductStockNotificationController.update))
    .delete(asyncHandler(ProductStockNotificationController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), asyncHandler(ProductStockNotificationController.delete))
  return productStockNotificationRouter
}

export default productStockNotificationRoutes
