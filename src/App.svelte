<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { setClient } from "svelte-apollo";
  import { token, isAuthenticated, user, sweets } from "./store";
  import auth from "./auth-service";
  import { getSplitLink, client } from "./apollo-service";
  let auth0Client;
  console.log(sweets);
  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticated.set(await auth0Client.isAuthenticated());
    const accessToken = await auth0Client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
      const splitLink = getSplitLink(accessToken.__raw);
      client.setLink(splitLink);
      client.resetStore();
    }
    user.set(await auth0Client.getUser());
  });
  setClient(client);
  token.subscribe(async (value) => {
    if (value) {
      const { data } = await http.fetchMyQuery(OperationDocsStore.getAll());
      console.log(data);
      sweets.set(data.laba3_sweets);
      console.log($sweets);
    }
  });

  function login() {
    auth.loginWithPopup(auth0Client, client);
  }

  function logout() {
    auth.logout(auth0Client);
  }

  const addSweet = async () => {
    const name = prompt("name") || "";
    const price = prompt("price") || "";
    const count = prompt("count") || "";
    const { insert_laba3_sweets_one } = await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name, price, count),
    );
    sweets.update((n) => [...n, insert_laba3_sweets_one]);
  };

  const deleteSweet = async () => {
    const name = prompt("which sweet to delete?") || "";
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
      sweets.update((n) => n.filter((sweet) => sweet.name !== name));
    }
  };
</script>

<main>
  {#if !$isAuthenticated}
    <button on:click={login}>Log in</button>
  {:else if $sweets.loading}
    <h1>Loading...</h1>
  {:else if $sweets.error}
    <h1>{JSON.stringify($sweets.error)}</h1>
  {:else}
    <button on:click={logout}>Log out</button>
    <button on:click={addSweet}>Add new sweet</button>
    <button on:click={deleteSweet}>Delete sweet</button>
    {#each $sweets as sweet}
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
