import { Router } from 'express'
import authRouter from './authRouter'
import userRouter from './userRouter'
import profileRouter from './profileRouter'
import companyRouter from './companyRouter'
import addressRouter from './addressRouter'
import recipientRouter from './recipientRouter'
import campaignRouter from './campaignRouter'
import salutationRouter from './salutationRouter'
import bundleRouter from './bundleRouter'
import bundleItemRouter from './bundleItemRouter'
import pictureRouter from './pictureRouter'
import shipmentRouter from './shipmentRouter'
import costCenterRouter from './costCenterRouter'
import productRouter from './productRouter'
import orderRouter from './orderRouter'
import secondaryDomainRouter from './secondaryDomainRouter'
import legalTextRouter from './legalTextRouter'
import privacyRuleRouter from './privacyRuleRouter'
import accessPermissionsRouter from './accessPermissionRouter'
import healthCheckRouter from './healthCheckRouter'
import shippingMethodRouter from './shippingMethodRouter'
import webhookRouter from './webhookRouter'
import pendingOrderRouter from './pendingOrderRouter'
import cardTemplateRouter from './cardTemplateRouter'
import greetingCardRouter from './greetingCardRouter'
import campaignShippingDestinationRouter from './campaignShippingDestinationRouter'
import campaignOrderLimitRouter from './campaignOrderLimitRouter'
import emailTemplateRouter from './emailTemplateRouter'
import emailTempleTypeRouter from './emailTemplateTypeRouter'
import campaignAddressRouter from './campaignAddressRouter'
import maintenanceModeRouter from './maintenanceRouter'
import productCategoryRouter from './productCategoryRouter'
import productCategoryTagRouter from './productCategoryTagRouter'
import productGraduatedPriceRouter from './productGraduatedPriceRouter'
import productColorRouter from './productColorRouter'
import productMaterialRouter from './productMaterialRouter'
import productSizeRouter from './productSizeRouter'
import productAccessControlGroupRouter from './productAccessControlGroupRouter'
import companyInProductAccessControlGroupRouter from './companyInProductAccessControlGroupRouter'
import userInProductAccessControlGroupRouter from './userInProductAccessControlGroupRouter'
import productCategoryTagInProductAccessControlGroupRouter from './productCategoryTagInProductAccessControlGroupRouter'
import companyUserGroupRouter from './companyUserGroupRouter'
import userInCompanyUserGroupRouter from './userInCompanyUserGroupRouter'
import companyUserGroupInProductAccessControlGroupRouter from './companyUserGroupInProductAccessControlGroupRouter'
import taxRateRouter from './taxRateRouter'
import massUnitRouter from './massUnitRouter'
import salesUnitRouter from './salesUnitRouter'
import productInProductCategoryRouter from './productInProductCategoryRouter'
import invoiceRouter from './invoiceRouter'
import inboundRouter from './jtl/inboundRouter'
import outboundRouter from './jtl/outboundRouter'
import itemRouter from './wawiAPI/itemRouter'
import categoryRouter from './wawiAPI/categoryRouter'
import campaignQuotaRouter from './campaignQuotaRouter'
import campaignQuotaNotificationRouter from './campaignQuotaNotificationRouter'
import apiKeyRouter from './apiKeyRouter'
import orderConfirmationRouter from './orderConfirmationRouter'
import packingSlipRouter from './packingSlipRouter'
import titleRouter from './titleRouter'
import campaignAdditionalProductSettingRouter from './campaignAdditionalProductSettingRouter'
import productCustomisationRouter from './productCustomisationRouter'
import productStockNotificationRouter from './productStockNotificationRouter'

const router = Router()

export const maintenanceModeBypassRoutes = {
  authRouter,
  maintenanceModeRouter,
  webhookRouter
}

const routes = [
  userRouter,
  profileRouter,
  companyRouter,
  addressRouter,
  recipientRouter,
  campaignRouter,
  salutationRouter,
  bundleRouter,
  bundleItemRouter,
  pictureRouter,
  shipmentRouter,
  costCenterRouter,
  productRouter,
  orderRouter,
  secondaryDomainRouter,
  legalTextRouter,
  privacyRuleRouter,
  accessPermissionsRouter,
  healthCheckRouter,
  shippingMethodRouter,
  pendingOrderRouter,
  cardTemplateRouter,
  greetingCardRouter,
  campaignShippingDestinationRouter,
  campaignOrderLimitRouter,
  emailTemplateRouter,
  emailTempleTypeRouter,
  campaignAddressRouter,
  productCategoryRouter,
  productCategoryTagRouter,
  productGraduatedPriceRouter,
  productColorRouter,
  productMaterialRouter,
  productSizeRouter,
  productAccessControlGroupRouter,
  companyInProductAccessControlGroupRouter,
  userInProductAccessControlGroupRouter,
  productCategoryTagInProductAccessControlGroupRouter,
  companyUserGroupRouter,
  userInCompanyUserGroupRouter,
  companyUserGroupInProductAccessControlGroupRouter,
  taxRateRouter,
  massUnitRouter,
  salesUnitRouter,
  productInProductCategoryRouter,
  invoiceRouter,
  inboundRouter,
  outboundRouter,
  itemRouter,
  categoryRouter,
  campaignQuotaRouter,
  campaignQuotaNotificationRouter,
  apiKeyRouter,
  orderConfirmationRouter,
  packingSlipRouter,
  titleRouter,
  campaignAdditionalProductSettingRouter,
  productCustomisationRouter,
  productStockNotificationRouter
]

routes.forEach((route) => {
  router.use(route())
})
export default router
