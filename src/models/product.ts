import { Model } from 'sequelize'
import type { ICompany, IProduct, IProductCategory, IProductCategoryTag, IProductPicture, NetRetailPrice, ProductType } from '../types'

const ProductModel = (sequelize: any, DataTypes: any): any => {
  interface ProductAttributes {
    id: string
    jfsku: string
    name: string
    merchantSku: string
    productGroup: string
    type: ProductType
    netRetailPrice: NetRetailPrice
    pictures: IProductPicture[]
    isVisible: boolean
  }

  class Product extends Model<ProductAttributes> {
    private readonly id: string
    private readonly jfsku: string
    private readonly name: string
    private readonly merchantSku: string
    private readonly productGroup: string
    private readonly type: ProductType
    private readonly netRetailPrice: NetRetailPrice
    private readonly pictures: IProductPicture[]
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly company: ICompany
    private readonly productCategory: IProductCategory
    private readonly productTags: IProductCategoryTag[]

    static associate (models: any): any {
      Product.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      })
      Product.belongsTo(models.ProductCategory, {
        foreignKey: 'productCategoryId',
        as: 'productCategory',
        onDelete: 'SET NULL'
      })
      Product.hasMany(models.ProductTag, {
        foreignKey: 'productId',
        as: 'productTags',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IProduct {
      return {
        id: this.id,
        jfsku: this.jfsku,
        name: this.name,
        merchantSku: this.merchantSku,
        productGroup: this.productGroup,
        type: this.type,
        netRetailPrice: this.netRetailPrice,
        pictures: this.pictures,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        company: this.company,
        productCategory: this.productCategory,
        productTags: this.productTags
      }
    }
  };

  Product.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    jfsku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchantSku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    netRetailPrice: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        amount: 0,
        currency: 'EUR',
        discount: 0
      }
    },
    pictures: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Product'
  })

  return Product
}

module.exports = ProductModel
