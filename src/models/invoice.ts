import { Model } from 'sequelize'
import type {
  IInvoice,
  ICompany,
  ICampaign,
  IUser,
  OrderLineRequest,
  ShippingAddressRequest,
  BillingAddressRequest
} from '../types'

const InvoiceModel = (sequelize: any, DataTypes: any): any => {
  interface InvoiceAttributes {
    id: string
    postedOrderId: string
    invoiceNumber: string
    taxRate: number
    discountRate: number
    totalVat: number
    totalNet: number
    totalGross: number
    totalDiscount: number
    totalShipping: number
    amountPaid: number
    currency: string
    status: string
    isEmailSent: boolean
    dueDate: Date
    deliveryDate: Date
    documentDate: Date
    orderLineRequests: OrderLineRequest[]
    shippingAddressRequests: ShippingAddressRequest[]
    billingAddressRequests: BillingAddressRequest[]
  }

  class Invoice extends Model<InvoiceAttributes> {
    private readonly id: string
    private readonly postedOrderId: string
    private readonly invoiceNumber: string
    private readonly taxRate: number
    private readonly discountRate: number
    private readonly totalVat: number
    private readonly totalNet: number
    private readonly totalGross: number
    private readonly totalDiscount: number
    private readonly totalShipping: number
    private readonly amountPaid: number
    private readonly currency: string
    private readonly status: string
    private readonly isEmailSent: boolean
    private readonly dueDate: Date
    private readonly deliveryDate: Date
    private readonly documentDate: Date
    private readonly company: ICompany
    private readonly campaign: ICampaign
    private readonly owner: IUser
    private readonly orderLineRequests: OrderLineRequest[]
    private readonly shippingAddressRequests: ShippingAddressRequest[]
    private readonly billingAddressRequests: BillingAddressRequest[]
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      Invoice.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Invoice.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
      Invoice.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IInvoice {
      return {
        id: this.id,
        postedOrderId: this.postedOrderId,
        invoiceNumber: this.invoiceNumber,
        taxRate: this.taxRate,
        discountRate: this.discountRate,
        totalVat: this.totalVat,
        totalNet: this.totalNet,
        totalGross: this.totalGross,
        totalDiscount: this.totalDiscount,
        totalShipping: this.totalShipping,
        currency: this.currency,
        status: this.status,
        isEmailSent: this.isEmailSent,
        dueDate: this.dueDate,
        deliveryDate: this.deliveryDate,
        documentDate: this.documentDate,
        amountPaid: this.amountPaid,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        campaign: this.campaign,
        owner: this.owner,
        orderLineRequests: this.orderLineRequests,
        shippingAddressRequests: this.shippingAddressRequests,
        billingAddressRequests: this.billingAddressRequests
      }
    }
  };

  Invoice.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    postedOrderId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    taxRate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discountRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalVat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalNet: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalGross: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalDiscount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalShipping: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    amountPaid: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EUR'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open'
    },
    isEmailSent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    documentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    orderLineRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    shippingAddressRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    billingAddressRequests: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Invoice'
  })

  return Invoice
}

module.exports = InvoiceModel
