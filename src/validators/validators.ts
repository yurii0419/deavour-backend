import { Joi } from 'celebrate'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import * as countryList from '../utils/countries'
import * as userRoles from '../utils/userRoles'
import * as currencies from '../utils/currencies'
import * as appModules from '../utils/appModules'

dayjs.extend(utc)

const imageMimeTypes = ['image/bmp', 'image/jpeg', 'image/x-png', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

const validateCreatedUser = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validateCreatedUserByAdmin = Joi.object({
  user: Joi.object({
    firstName: Joi.string().required().max(64),
    lastName: Joi.string().required().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    password: Joi.string().min(6).max(64).required(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isActive: Joi.boolean().default(true),
    isGhost: Joi.boolean().default(false),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
}).required()

const validateLogin = Joi.object({
  user: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().required()
  }).required()
}).required()

const validateUpdatedUser = Joi.object({
  user: Joi.object({
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().max(64),
    lastName: Joi.string().optional().max(64),
    username: Joi.string().lowercase().optional().allow(null).max(64).regex(/^\S+$/)
      .messages({
        'string.pattern.base': '{#label} cannot contain spaces'
      }),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    location: Joi.object({
      country: Joi.string().required().valid(...countryList.countries).allow('').allow(null)
    }).optional()
  }).required()
}).required()

const validateRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.ADMIN, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
}).required()

const validateEmailVerification = Joi.object({
  user: Joi.object({
    isVerified: Joi.bool()
      .required()
  }).required()
}).required()

const validateUserActivation = Joi.object({
  user: Joi.object({
    isActive: Joi.bool()
      .required()
  }).required()
}).required()

const validateUserCompanyRole = Joi.object({
  user: Joi.object({
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }).required()
}).required()

const validateUserCompany = Joi.object({
  user: Joi.object({
    companyId: Joi.string().uuid().required()
  }).required()
}).required()

const validatePassword = Joi.object({
  user: Joi.object({
    currentPassword: Joi.string().required(),
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validatePasswordReset = Joi.object({
  user: Joi.object({
    password: Joi.string().min(6).max(64).required()
  }).required()
}).required()

const validateUserPhoto = Joi.object({
  user: Joi.object({
    photo: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).required()
  }).required()
}).required()

const validateEmail = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required()
  }).required()
}).required()

const validateOtp = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.number().required()
  }).required()
}).required()

const validateUUID = Joi.object().keys({
  id: Joi.string().uuid(),
  userId: Joi.string().uuid()
}).required()

const validateTrackingId = Joi.object().keys({
  trackingId: Joi.string()
}).required()

const validateProductId = Joi.object().keys({
  id: Joi.alternatives().try(Joi.string().uuid(), Joi.string().length(11))
}).required()

const validateQueryParams = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  offset: Joi.number().optional(),
  search: Joi.any().optional(),
  pageToken: Joi.any().optional(),
  filter: Joi.object({
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().optional(),
    country: Joi.string().length(2).optional(),
    company: Joi.string().optional(),
    companyId: Joi.string().uuid(),
    type: Joi.string().optional(),
    isParent: Joi.string().trim().lowercase()
      .valid(...['true', 'false', 'true,false', 'false,true', 'true, false', 'false, true']),
    category: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    color: Joi.string().optional(),
    material: Joi.string().optional(),
    size: Joi.string().optional(),
    tag: Joi.string().uuid().optional()
  }).optional()
}).required()

const validateNotifications = Joi.object({
  user: Joi.object({
    notifications: Joi.object({
      isEnabled: Joi.boolean().optional()
    })
  })
}).required()

const validateCreatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().required().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().required().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null),
    inviteToken: Joi.string().uuid().optional()
  }).required()
}).required()

const validateUpdatedCompany = Joi.object({
  company: Joi.object({
    name: Joi.string().optional().max(64),
    suffix: Joi.string().max(32).allow('').allow(null),
    email: Joi.string().email().lowercase().optional().max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    vat: Joi.string().optional().max(24).allow('').allow(null),
    domain: Joi.string().domain().allow('').allow(null),
    customerId: Joi.number().optional().allow('').allow(null),
    inviteToken: Joi.string().uuid().optional()
  }).required()
}).required()

const validateDomain = Joi.object({
  company: Joi.object({
    isDomainVerified: Joi.boolean().required()
  }).required()
}).required()

const validateCreatedAddress = Joi.object({
  address: Joi.object({
    companyName: Joi.string().allow(null),
    email: Joi.string().email().allow(null),
    costCenter: Joi.string().allow(null),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(256),
    vat: Joi.string().allow('').allow(null).max(24),
    type: Joi.string().valid(...['billing', 'delivery', 'billingAndDelivery']).allow(null)
  }).required()
}).required()

const validateUpdatedAddress = Joi.object({
  address: Joi.object({
    companyName: Joi.string().allow(null),
    email: Joi.string().email().allow(null),
    costCenter: Joi.string().allow(null),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    addressAddition: Joi.string().allow('').allow(null).max(256),
    vat: Joi.string().allow('').allow(null).max(24),
    type: Joi.string().valid(...['billing', 'delivery', 'billingAndDelivery']).allow(null)
  }).required()
}).required()

const validateCreatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().required().valid(...countryList.countries).max(64),
    city: Joi.string().required().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().optional().allow('').allow(null).max(256),
    costCenter: Joi.string().optional().allow('').allow(null)
  }).required()
}).required()

const validateUpdatedRecipient = Joi.object({
  recipient: Joi.object({
    companyName: Joi.string().optional().allow('').allow(null).max(64),
    salutation: Joi.string().optional().allow('').allow(null).max(8),
    firstName: Joi.string().optional().allow('').allow(null).max(64),
    lastName: Joi.string().optional().allow('').allow(null).max(64),
    email: Joi.string().email().lowercase().optional().allow('').allow(null).max(128),
    phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
      .messages({
        'string.pattern.base': '{#label} must be numeric'
      }),
    country: Joi.string().optional().valid(...countryList.countries).max(64),
    city: Joi.string().optional().max(64),
    street: Joi.string().optional().allow('').allow(null).max(64),
    zip: Joi.string().optional().max(24),
    addressAddition: Joi.string().optional().allow('').allow(null).max(256),
    costCenter: Joi.string().optional().allow('').allow(null)
  }).required()
}).required()

const commonCampaignSchema = {
  name: Joi.string().required().allow('').allow(null).max(64),
  status: Joi.string().required().valid(...['draft', 'submitted']),
  type: Joi.string().required().valid(...['onboarding', 'birthday', 'christmas', 'marketing']),
  description: Joi.string().allow(null).allow('').max(1024)
}

const validateCampaign = Joi.object({
  campaign: Joi.object({
    ...commonCampaignSchema
  }).required()
}).required()

const validateCampaignAdmin = Joi.object({
  campaign: Joi.object({
    ...commonCampaignSchema,
    quota: Joi.number(),
    correctionQuota: Joi.number(),
    lastQuotaResetDate: Joi.date().allow(null),
    isQuotaEnabled: Joi.boolean(),
    isExceedQuotaEnabled: Joi.boolean(),
    isNoteEnabled: Joi.boolean(),
    isActive: Joi.boolean(),
    isHidden: Joi.boolean(),
    shippingMethodType: Joi.number().allow(null).default(null),
    shippingMethodIsDropShipping: Joi.boolean()
  }).required()
}).required()

const validateJoinCompany = Joi.object({
  user: Joi.object({
    email: Joi.string().email().lowercase().required().max(128),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]),
    actionType: Joi.string().valid(...['remove', 'add']).default('add')
  }).required()
}).required()

const validateSalutation = Joi.object({
  salutation: Joi.object({
    title: Joi.string().required().max(8)
  }).required()
}).required()

const validatePrivacyRule = Joi.object({
  privacyRule: Joi.object({
    module: Joi.string().required().valid(...appModules.MODULES_ARRAY),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required(),
    isEnabled: Joi.boolean()
  }).required()
}).required()

const validateSecondaryDomain = Joi.object({
  secondaryDomain: Joi.object({
    name: Joi.string().domain()
  }).required()
}).required()

const validateCostCenter = Joi.object({
  costCenter: Joi.object({
    center: Joi.string().required()
  }).required()
}).required()

const validateBundle = Joi.object({
  bundle: Joi.object({
    jfsku: Joi.string().allow('').allow(null).max(20),
    merchantSku: Joi.string().allow('').allow(null).max(40),
    name: Joi.string().required().max(128),
    description: Joi.string().allow(null).allow('').max(1024),
    price: Joi.number().max(1000000).min(0),
    isLocked: Joi.boolean(),
    isBillOfMaterials: Joi.boolean(),
    shippingMethodType: Joi.number().allow(null).default(null),
    specifications: Joi.object({
      isBatch: Joi.boolean().default(false),
      isDivisible: Joi.boolean().default(false),
      isBestBefore: Joi.boolean().default(false),
      isSerialNumber: Joi.boolean().default(false),
      isBillOfMaterials: Joi.boolean().default(false),
      billOfMaterialsComponents: Joi.array().items(
        Joi.object({
          name: Joi.string().required().max(128),
          jfsku: Joi.string().required().max(20),
          merchantSku: Joi.string().required().max(40),
          quantity: Joi.number().default(1)
        })
      ).min(1).required()
    }).default(null)
  }).required()
}).required()

const validatePicture = Joi.object({
  picture: Joi.object({
    url: Joi.string().uri().required(),
    filename: Joi.string().required(),
    size: Joi.number(),
    mimeType: Joi.string().valid(...imageMimeTypes).allow(null).allow('')
  }).required()
}).required()

const validateProduct = Joi.object({
  product: Joi.object({
    name: Joi.string().required().max(64),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    }),
    productCategoryId: Joi.string().uuid().allow(null).default(null),
    isParent: Joi.boolean(),
    properties: Joi.object({
      color: Joi.string().required().allow(null).allow(''),
      material: Joi.string().required().allow(null).allow(''),
      size: Joi.string().required().allow(null).allow('')
    })
  }).required()
}).required()

const validateProductAdmin = Joi.object({
  product: Joi.object({
    companyId: Joi.string().uuid().allow(null).default(null),
    isVisible: Joi.bool().default(true),
    name: Joi.string().required().max(64),
    jfsku: Joi.string().required().max(64),
    merchantSku: Joi.string().required().max(64),
    productGroup: Joi.string().required().max(64),
    type: Joi.string().required().valid(...['generic', 'custom']),
    netRetailPrice: Joi.object({
      amount: Joi.number(),
      currency: Joi.string().required().valid(...currencies.currencies),
      discount: Joi.number()
    }),
    productCategoryId: Joi.string().uuid().allow(null).default(null),
    isParent: Joi.boolean(),
    properties: Joi.object({
      color: Joi.string().required().allow(null).allow(''),
      material: Joi.string().required().allow(null).allow(''),
      size: Joi.string().required().allow(null).allow('')
    })
  }).required()
}).required()

const validateProductCompany = Joi.object({
  product: Joi.object({
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
}).required()

const validateOrder = Joi.object({
  order: Joi.object({
    outboundId: Joi.string().required(),
    fulfillerId: Joi.string().required(),
    merchantOutboundNumber: Joi.string().required(),
    warehouseId: Joi.string().required(),
    status: Joi.string().required(),
    shippingAddress: Joi.object({
      company: Joi.string(),
      lastname: Joi.string(),
      city: Joi.string().required(),
      email: Joi.string(),
      firstname: Joi.string(),
      street: Joi.string().required(),
      zip: Joi.string().required(),
      country: Joi.string().required()
    }),
    items: Joi.array().items(
      Joi.object({
        jfsku: Joi.string().required().max(20),
        outboundItemId: Joi.string().required(),
        name: Joi.string().required().max(128),
        merchantSku: Joi.string().required().max(40),
        quantity: Joi.number(),
        itemType: Joi.string().required().valid(...['BillOfMaterials', 'Product']),
        quantityOpen: Joi.number(),
        externalNumber: Joi.string().allow('').allow(null),
        price: Joi.number(),
        vat: Joi.number(),
        billOfMaterialsId: Joi.string()
      })
    ).min(1),
    senderAddress: Joi.object({
      company: Joi.string(),
      city: Joi.string().required(),
      email: Joi.string(),
      street: Joi.string().required(),
      zip: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().required()
    }),
    attributes: Joi.array().items(
      Joi.object(
        {
          key: Joi.string(),
          value: Joi.string(),
          attributeType: Joi.string()
        }
      )
    ),
    priority: Joi.number(),
    currency: Joi.string(),
    externalNote: Joi.string(),
    salesChannel: Joi.string(),
    desiredDeliveryDate: Joi.date(),
    shippingMethodId: Joi.string(),
    shippingType: Joi.string(),
    shippingFee: Joi.number(),
    orderValue: Joi.number(),
    attachments: Joi.any(),
    modificationInfo: Joi.any()
  })
}).required()

const validateLegalText = Joi.object({
  legalText: Joi.object({
    type: Joi.string().required().valid(...['privacy', 'terms', 'defaultPrivacy', 'defaultTerms']),
    template: Joi.object({
      title: Joi.string().required().max(128),
      sections: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          content: Joi.string().required()
        }).required()
      ).min(1).required()
    }).required()
  }).required()
}).required()

const validateRegistrationQueryParams = Joi.object({
  companyId: Joi.string()
}).required()

const validateShippingMethod = Joi.object({
  shippingMethod: Joi.object({
    name: Joi.string().required().max(128),
    shippingType: Joi.number().required(),
    isDropShipping: Joi.boolean().required(),
    insuranceValue: Joi.number().allow(null)
  }).required()
}).required()

const commonPendingOrderSchema = {
  platform: Joi.number(),
  language: Joi.number(),
  currency: Joi.string(),
  orderNo: Joi.string(),
  inetorderno: Joi.number(),
  shippingId: Joi.number(),
  shipped: Joi.date(),
  deliverydate: Joi.date(),
  note: Joi.string().allow('').allow(null),
  description: Joi.string().allow('').allow(null),
  costCenter: Joi.string().allow('').allow(null),
  paymentType: Joi.number(),
  paymentTarget: Joi.number(),
  discount: Joi.number(),
  orderStatus: Joi.number(),
  quantity: Joi.number().default(1),
  orderLineRequests: Joi.array().items(
    Joi.object({
      itemName: Joi.string(),
      articleNumber: Joi.string(),
      itemNetSale: Joi.number(),
      itemVAT: Joi.number(),
      quantity: Joi.number(),
      type: Joi.number(),
      discount: Joi.number(),
      netPurchasePrice: Joi.number()
    })
  ).min(1).required(),
  shippingAddressRequests: Joi.array().items(
    Joi.object({
      salutation: Joi.string().allow('').allow(null),
      firstName: Joi.string(),
      lastName: Joi.string(),
      title: Joi.string().allow('').allow(null),
      company: Joi.string().allow('').allow(null),
      companyAddition: Joi.string().allow('').allow(null),
      street: Joi.string(),
      addressAddition: Joi.string().allow('').allow(null),
      zipCode: Joi.string(),
      place: Joi.string(),
      phone: Joi.string().allow('').allow(null),
      state: Joi.string().allow('').allow(null),
      country: Joi.string(),
      iso: Joi.string().allow('').allow(null),
      telephone: Joi.string().allow('').allow(null),
      mobile: Joi.string().allow('').allow(null),
      fax: Joi.string().allow('').allow(null),
      email: Joi.string()
    })
  ).min(1).required(),
  paymentInformationRequests: Joi.array().items(
    Joi.object({
      bankName: Joi.string(),
      blz: Joi.string(),
      accountno: Joi.string(),
      cardno: Joi.string(),
      validity: Joi.date(),
      cvv: Joi.string(),
      cardType: Joi.string(),
      owner: Joi.string(),
      iban: Joi.string(),
      bic: Joi.string()
    })
  )
}
const validatePendingOrder = Joi.object({
  pendingOrders: Joi.array().items(
    Joi.object({ ...commonPendingOrderSchema })
  ).min(1).required()
}).required()

const validatePendingOrderAdmin = Joi.object({
  pendingOrders: Joi.array().items(
    Joi.object({
      ...commonPendingOrderSchema,
      customerId: Joi.number().optional().allow('').allow(null),
      campaignId: Joi.string().uuid(),
      companyId: Joi.string().uuid()
    })
  ).min(1).required()
}).required()

const validateCardTemplate = Joi.object({
  cardTemplate: Joi.object({
    name: Joi.string().max(128).allow('').allow(null).required(),
    description: Joi.string().max(128).allow('').allow(null).required(),
    front: Joi.string().allow('').max(5000).allow(null).required(),
    back: Joi.string().allow('').max(5000).allow(null).required(),
    frontOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape']),
    backOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape'])
  }).required()
}).required()

const validateCardSetting = Joi.object({
  cardSetting: Joi.object({
    isEnabled: Joi.boolean().allow(null),
    isFrontSelectable: Joi.boolean().allow(null),
    isRotationEnabled: Joi.boolean().allow(null),
    isBackEditable: Joi.boolean().allow(null),
    isAutoProcessingEnabled: Joi.boolean().allow(null),
    defaultBack: Joi.string().allow('').max(5000).allow(null),
    defaultFront: Joi.string().allow('').max(5000).allow(null),
    exportOrientation: Joi.string().allow('').allow(null).valid(...['portrait', 'landscape']),
    exportSides: Joi.string().allow('').allow(null).valid('both', 'front', 'back'),
    supplierEmail: Joi.string().email().allow(null),
    articleId: Joi.string().allow('').allow(null)
  }).required()
}).required()

const validateGreetingCard = Joi.object({
  greetingCard: Joi.object({
    articleNumber: Joi.string().required(),
    articleName: Joi.string().required(),
    url: Joi.string().uri().required(),
    totalStock: Joi.number(),
    inventory: Joi.number(),
    availableStock: Joi.number(),
    jtlfpid: Joi.string().required(),
    companyId: Joi.string().uuid().allow(null).default(null)
  }).required()
}).required()

const validatePostedOrderIds = Joi.object().keys({
  postedOrderIds: Joi.array().items(Joi.string().min(17)).min(1).required()
}).required()

const validateAuthToken = Joi.object({
  auth: Joi.object({
    token: Joi.string().required()
  }).required()
}).required()

const validateCampaignOrderLimit = Joi.object({
  campaignOrderLimit: {
    limit: Joi.number().required(),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER])
      .required()
  }
}).required()

const validateCampaignShippingDestination = Joi.object({
  campaignShippingDestination: Joi.object({
    country: Joi.string().required().valid(...countryList.countries)
  }).required()
}).required()

const validatePasswordResetAdmin = Joi.object({
  user: Joi.object({
    sendEmail: Joi.boolean().default(true)
  }).required()
}).required()

const validateEmailTemplate = Joi.object({
  emailTemplate: Joi.object({
    subject: Joi.string().max(256).required(),
    template: Joi.string().required(),
    emailTemplateTypeId: Joi.string().uuid().required()
  }).required()
}).required()

const validateEmailTemplateType = Joi.object({
  emailTemplateType: Joi.object({
    name: Joi.string().max(64).required(),
    type: Joi.string().max(32).required(),
    description: Joi.string().max(256).required(),
    placeholders: Joi.array().items(Joi.string().max(16).lowercase()).min(1).required()
  }).required()
}).required()

const validateUserCompanyInvite = Joi.object({
  user: Joi.object({
    companyInviteCode: Joi.string().required()
  }).required()
}).required()

const validateCampaignAddress = Joi.object({
  campaignAddresses: Joi.array().items(
    Joi.object({
      companyName: Joi.string().allow(null),
      email: Joi.string().email().allow(null),
      costCenter: Joi.string().allow(null),
      country: Joi.string().required().valid(...countryList.countries).max(64),
      city: Joi.string().required().max(64),
      street: Joi.string().optional().allow('').allow(null).max(64),
      zip: Joi.string().optional().max(24),
      phone: Joi.string().optional().allow('').allow(null).min(4).max(24).regex(/^(\+?)[0-9()\s-]{4,24}$/)
        .messages({
          'string.pattern.base': '{#label} must be numeric'
        }),
      addressAddition: Joi.string().allow('').allow(null).max(256),
      vat: Joi.string().allow('').allow(null).max(24),
      type: Joi.string().valid(...['billing', 'return']).required()
    })).min(1).required()
}).required()

const validateMaintenanceMode = Joi.object({
  maintenanceMode: Joi.object({
    isActive: Joi.boolean().required(),
    reason: Joi.string().required(),
    startDate: Joi.date().min(dayjs().toDate()).required(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .not(Joi.ref('startDate')).messages({
        'any.invalid': 'End date must not be equal to start date'
      })
      .messages({
        'date.min': 'End date must be after start date'
      }).required()
  }).required()
}).required()

const validateCompanyTheme = Joi.object({
  company: Joi.object({
    theme: Joi.object({
      primaryColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      secondaryColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      backgroundColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      foregroundColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      }),
      accentColor: Joi.string().required().regex(/^#[A-Fa-f0-9]{6}$/).messages({
        'string.pattern.base': '{#label} must be a valid hex color'
      })
    }).allow(null)
  }).required()
}).required()

const validateCompanyLogo = Joi.object({
  company: Joi.object({
    logo: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null)
  }).required()
}).required()

const validateCompanySubscription = Joi.object({
  companySubscription: Joi.object({
    plan: Joi.string().required().valid(...['premium', 'basic', 'custom', 'trial']),
    description: Joi.string().required().max(64),
    startDate: Joi.date().min(dayjs().toDate()).required(),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .not(Joi.ref('startDate')).messages({
        'any.invalid': 'End date must not be equal to start date'
      })
      .messages({
        'date.min': 'End date must be after start date'
      }).required(),
    autoRenew: Joi.boolean().default(false)
  }).required()
})

const validateProductCategory = Joi.object({
  productCategory: Joi.object({
    name: Joi.string().lowercase().required(),
    description: Joi.string().max(256),
    picture: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).allow(null)
  }).required()
})

const validateProductCategoryTag = Joi.object({
  productCategoryTag: Joi.object({
    name: Joi.string().lowercase().required()
  }).required()
})

const validateProductTag = Joi.object({
  productTag: Joi.object({
    productCategoryTagIds: Joi.array().items(Joi.string().uuid()).required()
  }).required()
})

const validateChild = Joi.object({
  product: Joi.object({
    parentId: Joi.string().uuid().required()
  }).required()
})

const validateChildren = Joi.object({
  product: Joi.object({
    childIds: Joi.array().items(Joi.string().uuid()).required()
  }).required()
})

export default {
  validateCreatedUser,
  validateLogin,
  validateUpdatedUser,
  validateRole,
  validatePassword,
  validateUUID,
  validateEmail,
  validateOtp,
  validateUserPhoto,
  validatePasswordReset,
  validateNotifications,
  validateCreatedCompany,
  validateQueryParams,
  validateUpdatedCompany,
  validateCreatedAddress,
  validateUpdatedAddress,
  validateCreatedRecipient,
  validateUpdatedRecipient,
  validateCampaign,
  validateCampaignAdmin,
  validateJoinCompany,
  validateUserCompanyRole,
  validateSalutation,
  validateCostCenter,
  validateDomain,
  validateEmailVerification,
  validateUserActivation,
  validateCreatedUserByAdmin,
  validateBundle,
  validateUserCompany,
  validatePicture,
  validateTrackingId,
  validateProduct,
  validateProductAdmin,
  validateProductCompany,
  validateOrder,
  validateSecondaryDomain,
  validateLegalText,
  validatePrivacyRule,
  validateRegistrationQueryParams,
  validateShippingMethod,
  validatePendingOrder,
  validatePendingOrderAdmin,
  validateCardTemplate,
  validateCardSetting,
  validateGreetingCard,
  validatePostedOrderIds,
  validateProductId,
  validateAuthToken,
  validateCampaignOrderLimit,
  validateCampaignShippingDestination,
  validatePasswordResetAdmin,
  validateEmailTemplate,
  validateEmailTemplateType,
  validateUserCompanyInvite,
  validateCampaignAddress,
  validateMaintenanceMode,
  validateCompanyTheme,
  validateCompanySubscription,
  validateCompanyLogo,
  validateProductCategory,
  validateProductCategoryTag,
  validateProductTag,
  validateChild,
  validateChildren
}
