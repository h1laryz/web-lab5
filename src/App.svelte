<script>
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";

  function createApolloClient() {
    const httpLink = new HttpLink({
      uri: "https://lab3web333.herokuapp.com/v1/graphql",
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: "wss://lab3web333.herokuapp.com/v1/graphql",
      options: {
        reconnect: true,
      },
    });
    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );
    return new ApolloClient({
      link,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);
  const sweets = subscribe(OperationDocsStore.subscribeToAll());

  const addSweet = async () => {
    const name = prompt("name") || "";
    const price = prompt("price") || "";
    const count = prompt("count") || "";
    await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name, price, count),
    );
  };

  const deleteSweet = async () => {
    const name = prompt("which sweet to delete?") || "";
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
    }
  };
</script>

<main>
  {#if $sweets.loading}
    <h1>Loading...</h1>
  {:else if $sweets.error}
    <h1>{$sweets.error}</h1>
  {:else}
    <button on:click={addSweet}>Add new sweet</button>
    <button on:click={deleteSweet}>Delete sweet</button>
    {#each $sweets.data.laba3_sweets as sweet}
      <div class="sweetItem">
        <p>Name: {sweet.name}</p>
        <p>Price: {sweet.price}</p>
        <p>Count: {sweet.count}</p>
      </div>
    {/each}
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
  .sweetItem {
    border: 1px solid #000;
    margin: 10px;
    padding: 10px;
  }
</style>
