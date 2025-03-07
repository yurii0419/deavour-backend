import { Model } from 'sequelize'
import type { ICostCenter } from '../types'

const CostCenterModel = (sequelize: any, DataTypes: any): any => {
  interface CostCenterAttributes {
    id: string
    center: string
  }

  class CostCenter extends Model<CostCenterAttributes> {
    private readonly id: string
    private readonly center: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      CostCenter.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ICostCenter {
      return {
        id: this.id,
        center: this.center,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  CostCenter.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    center: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'CostCenter'
  })

  return CostCenter
}

module.exports = CostCenterModel
