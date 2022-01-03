import { get } from "svelte/store";
import { token, requestCounter, error } from "./store";

class RequestHelper {
  constructor() {
    this.HASURA_URL = API_URL;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
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

    return await result.json();
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      error.set(errors[0].message);
    } else {
      error.set("");
    }
    requestCounter.update((n) => n - 1);

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

    if (errors) {
      // handle those errors like a pro
      console.error(errors);
      error.set(errors[0].message);
    } else {
      error.set("");
    }
    requestCounter.update((n) => n - 1);

    // do something great with this precious data
    console.log(data);
    return data;
  }
}

export default new RequestHelper();
