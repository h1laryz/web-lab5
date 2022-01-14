export default class OperationDocsStore {
  static getAll() {
    return `query MyQuery {
      laba3_sweets {
        price
        name
        id
        count
      }
    }
    
          `;
  }

  static addOne(name, price, count = 0) {
    return `mutation MyMutation {
      insert_laba3_sweets_one(object: {price: "${price}", name: "${name}", count: ${count}}) {
        count
        name
        price
        id
      }
    }    
      `;
  }

  static deleteById(id) {
    return `mutation MyMutation {
      delete_laba3_sweets(where: {id: {_eq: "${id}"}}) {
        affected_rows
      }
    }
    `;
  }
}
