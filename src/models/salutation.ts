import { Model } from 'sequelize'
import type { ISalutation } from '../types'

const SalutationModel = (sequelize: any, DataTypes: any): any => {
  interface SalutationAttributes {
    id: string
    name: string
  }

  class Salutation extends Model<SalutationAttributes> {
    private readonly id: string
    private readonly name: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {

    }

    toJSONFor (): ISalutation {
      return {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  Salutation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Salutation'
  })

  return Salutation
}

module.exports = SalutationModel
