import { gql } from "@apollo/client";

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
      }
    }    
      `;
  }

  static deleteByName(name) {
    return `mutation MyMutation {
      delete_laba3_sweets(where: {name: {_eq: "${name}"}}) {
        affected_rows
      }
    }
    `;
  }

  static subscribeToAll() {
    return gql`
      subscription MySubscription {
        laba3_sweets {
          price
          name
          id
          count
        }
      }
    `;
  }
}
