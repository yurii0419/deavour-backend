import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductCategoryTagService extends BaseService {
  recordName (): string {
    return 'Product Category Tag'
  }

  async insert (data: any): Promise<any> {
    const { productCategoryTag, productCategory } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productCategoryTag.name,
        productCategoryId: productCategory.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productCategoryTag })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productCategoryTag, id: uuidv1(), productCategoryId: productCategory.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductCategoryTagService
