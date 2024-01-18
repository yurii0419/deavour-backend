import { Model } from 'sequelize'
import type { CampaignStatus, CampaignType, ICampaign, ICardSetting, ICardTemplate, ICompany } from '../types'

const CampaignModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAttributes {
    id: string
    name: string
    status: CampaignStatus
    type: CampaignType
    description: string
    quota: number
    usedQuota: number
    correctionQuota: number
    lastQuotaResetDate: Date
    isQuotaEnabled: boolean
    isExceedQuotaEnabled: boolean
    isNoteEnabled: boolean
    isActive: boolean
    isHidden: boolean
    shippingDestinationCountry: string | null
  }

  class Campaign extends Model<CampaignAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly status: CampaignStatus
    private readonly type: CampaignType
    private readonly description: string
    private readonly quota: number
    private readonly usedQuota: number
    private readonly correctionQuota: number
    private readonly lastQuotaResetDate: Date
    private readonly isQuotaEnabled: boolean
    private readonly isExceedQuotaEnabled: boolean
    private readonly isNoteEnabled: boolean
    private readonly isActive: boolean
    private readonly isHidden: boolean
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly cardTemplates: ICardTemplate[]
    private readonly cardSetting: ICardSetting
    private readonly shippingDestinationCountry: string | null

    static associate (models: any): any {
      Campaign.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.Recipient, {
        foreignKey: 'campaignId',
        as: 'recipients',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.Bundle, {
        foreignKey: 'campaignId',
        as: 'bundles',
        onDelete: 'CASCADE'
      })
      Campaign.hasMany(models.CardTemplate, {
        foreignKey: 'campaignId',
        as: 'cardTemplates',
        onDelete: 'CASCADE'
      })
      Campaign.hasOne(models.CardSetting, {
        foreignKey: 'campaignId',
        as: 'cardSetting',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaign {
      return {
        id: this.id,
        name: this.name,
        status: this.status,
        type: this.type,
        description: this.description,
        quota: this.quota,
        usedQuota: this.usedQuota,
        correctionQuota: this.correctionQuota,
        lastQuotaResetDate: this.lastQuotaResetDate,
        isQuotaEnabled: this.isQuotaEnabled,
        isExceedQuotaEnabled: this.isExceedQuotaEnabled,
        isNoteEnabled: this.isNoteEnabled,
        isActive: this.isActive,
        isHidden: this.isHidden,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        cardTemplates: this.cardTemplates,
        cardSetting: this.cardSetting,
        shippingDestinationCountry: this.shippingDestinationCountry
      }
    }
  };

  Campaign.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    usedQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    correctionQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastQuotaResetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isQuotaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isExceedQuotaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isNoteEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    shippingDestinationCountry: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Campaign'
  })

  return Campaign
}

module.exports = CampaignModel
