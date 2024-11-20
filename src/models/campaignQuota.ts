import { Model } from 'sequelize'
import type { ICampaignQuota } from '../types'

const CampaignQuotaModel = (sequelize: any, DataTypes: any): any => {
  interface CampaignQuotaAttributes {
    id: string
    orderedQuota: number
    orderedDate: Date
  }

  class CampaignQuota extends Model<CampaignQuotaAttributes> {
    private readonly id: string
    private readonly orderedQuota: number
    private readonly orderedDate: Date
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CampaignQuota.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICampaignQuota {
      return {
        id: this.id,
        orderedQuota: this.orderedQuota,
        orderedDate: this.orderedDate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CampaignQuota.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    orderedQuota: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderedDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CampaignQuota',
    tableName: 'CampaignQuotas'
  })

  return CampaignQuota
}

module.exports = CampaignQuotaModel
