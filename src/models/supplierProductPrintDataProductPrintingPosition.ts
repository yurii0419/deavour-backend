import { Model } from 'sequelize'
import type { ISupplierProductPrintDataImage, ISupplierProductPrintDataPoint, ISupplierProductPrintDataPrintingTechnique, ISupplierProductPrintDataProductPrintingPosition } from '../types'

const SupplierProductPrintDataProductPrintingPositionModel = (sequelize: any, DataTypes: any): any => {
  interface SupplierProductPrintDataProductPrintingPositionAttributes {
    id: string
    positionId: string
    printSizeUnit: string
    maxPrintSizeHeight: number
    maxPrintSizeWidth: number
    rotation: number
    printPositionType: string
    printingTechniques: string
    points: object
    images: object
    supplierProductPrintDataProductId: string
  }

  class SupplierProductPrintDataProductPrintingPosition extends Model<SupplierProductPrintDataProductPrintingPositionAttributes> {
    private readonly id: string
    private readonly positionId: string
    private readonly printSizeUnit: string
    private readonly maxPrintSizeHeight: number
    private readonly maxPrintSizeWidth: number
    private readonly rotation: number
    private readonly printPositionType: string
    private readonly printingTechniques: ISupplierProductPrintDataPrintingTechnique[]
    private readonly points: ISupplierProductPrintDataPoint[]
    private readonly images: ISupplierProductPrintDataImage[]
    private readonly supplierProductPrintDataProductId: string
    private readonly createdAt: Date
    private readonly updatedAt: Date

    static associate (models: any): any {
      SupplierProductPrintDataProductPrintingPosition.belongsTo(models.SupplierProductPrintDataProduct, {
        foreignKey: 'supplierProductPrintDataProductId',
        as: 'supplierProduct',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): ISupplierProductPrintDataProductPrintingPosition {
      return {
        id: this.id,
        positionId: this.positionId,
        printSizeUnit: this.printSizeUnit,
        maxPrintSizeHeight: this.maxPrintSizeHeight,
        maxPrintSizeWidth: this.maxPrintSizeWidth,
        rotation: this.rotation,
        printPositionType: this.printPositionType,
        printingTechniques: this.printingTechniques,
        points: this.points,
        images: this.images,
        supplierProductPrintDataProductId: this.supplierProductPrintDataProductId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }
  };

  SupplierProductPrintDataProductPrintingPosition.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    positionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    printSizeUnit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maxPrintSizeHeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    maxPrintSizeWidth: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    rotation: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    printPositionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    printingTechniques: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    points: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    supplierProductPrintDataProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'SupplierProductPrintDataProduct', key: 'id' }
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'SupplierProductPrintDataProductPrintingPosition'
  })

  return SupplierProductPrintDataProductPrintingPosition
}

module.exports = SupplierProductPrintDataProductPrintingPositionModel
