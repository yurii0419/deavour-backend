import { Model } from 'sequelize'
import { CampaignStatus, CampaignType, ICampaign, ICompany } from '../types'

const CampaignModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignAttributes {
    id: string
    name: string
    status: CampaignStatus
    type: CampaignType
    description: string
  }

  class Campaign extends Model<CampaignAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly status: CampaignStatus
    private readonly type: CampaignType
    private readonly description: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany

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
    }

    toJSONFor (): ICampaign {
      return {
        id: this.id,
        name: this.name,
        status: this.status,
        type: this.type,
        description: this.description,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company
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
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Campaign'
  })

  return Campaign
}

module.exports = CampaignModel
