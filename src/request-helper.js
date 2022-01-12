import { get } from "svelte/store";
import { token, requestCounter, error } from "./store";

class RequestHelper {
  constructor() {
    this.HASURA_URL = API_URL;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    try {
      const result = await fetch(this.HASURA_URL, {
        method: "POST",
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName,
        }),
        headers: {
          Authorization: `Bearer ${get(token)}`,
        },
      });

      return result.json();
    } catch (e) {
      error.set(e.message);
      counter.update((n) => n - 1);
    }
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      throw new Error(errors[0].message);
    } else {
      error.set("");
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.executeMyMutation(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      throw new Error(errors[0].message);
    } else {
      error.set("");
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }
}

export default new RequestHelper();
