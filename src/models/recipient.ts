import { Model } from 'sequelize'
import type { ICompany, IRecipient, Nullable } from '../types'

const RecipientModel = (sequelize: any, DataTypes: any): any => {
  interface RecipientAttributes {
    id: string
    companyName: string
    salutation: string
    title: string
    firstName: string
    lastName: string
    email: string
    phone: string
    country: string
    city: string
    street: string
    zip: string
    addressAddition: string
    costCenter: string
    hireDate: Nullable<Date>
    startDate: Nullable<Date>
    birthDate: Nullable<Date>
    releaseDate: Nullable<Date>
  }

  class Recipient extends Model<RecipientAttributes> {
    private readonly id: string
    private readonly salutation: string
    private readonly title: string
    private readonly companyName: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly email: string
    private readonly phone: string
    private readonly country: string
    private readonly city: string
    private readonly street: string
    private readonly zip: string
    private readonly addressAddition: string
    private readonly costCenter: string
    private readonly createdAt: Date
    private readonly updatedAt: Date
    private readonly hireDate: Nullable<Date>
    private readonly startDate: Nullable<Date>
    private readonly birthDate: Nullable<Date>
    private readonly releaseDate: Nullable<Date>
    private readonly company: ICompany

    static associate (models: any): any {
      Recipient.belongsTo(models.Campaign, {
        foreignKey: 'campaignId',
        as: 'campaign',
        onDelete: 'CASCADE'
      })
    }

    toJSONFor (): IRecipient {
      return {
        id: this.id,
        companyName: this.companyName,
        salutation: this.salutation,
        title: this.title,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        country: this.country,
        city: this.city,
        street: this.street,
        zip: this.zip,
        addressAddition: this.addressAddition,
        costCenter: this.costCenter,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        hireDate: this.hireDate,
        startDate: this.startDate,
        birthDate: this.birthDate,
        releaseDate: this.releaseDate,
        company: this.company
      }
    }
  };

  Recipient.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salutation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressAddition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Recipient'
  })

  return Recipient
}

module.exports = RecipientModel
