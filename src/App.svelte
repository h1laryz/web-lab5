<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import {
    token,
    isAuthenticated,
    user,
    sweets,
    requestCounter,
    error,
  } from "./store";
  import auth from "./auth-service";
  let auth0Client;
  let online;
  const toAdd = {};
  const toDelete = {};
  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticated.set(await auth0Client.isAuthenticated());
    const accessToken = await auth0Client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
    }
    user.set(await auth0Client.getUser());
  });
  token.subscribe(async (value) => {
    if (value) {
      const { data } = await http.fetchMyQuery(OperationDocsStore.getAll());
      sweets.set(data.laba3_sweets);
    }
  });

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    auth.logout(auth0Client);
  }

  const addSweet = async () => {
    const { name, price, count } = toAdd;
    const { insert_laba3_sweets_one } = await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name, price, count),
    );
    if (insert_laba3_sweets_one) {
      sweets.update((n) => [...n, insert_laba3_sweets_one]);
    }
  };

  const deleteSweet = async () => {
    const { name } = toDelete;
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
      sweets.update((n) => n.filter((sweet) => sweet.name !== name));
    }
  };
</script>

<svelte:window bind:online />

<main>
  {#if !online}
    <h1>You are offline</h1>
  {:else if !$isAuthenticated}
    <button on:click={login}>Log in</button>
  {:else if $sweets.loading || $requestCounter}
    <h1>Loading...</h1>
  {:else if $sweets.error}
    <h1>{JSON.stringify($sweets.error)}</h1>
  {:else if $error}
    <h1>{$error}</h1>
  {:else}
    <button on:click={logout}>Log out</button>
    <div>
      <input placeholder="Name" bind:value={toAdd.name} />
      <input placeholder="Price" bind:value={toAdd.price} />
      <input placeholder="Count" bind:value={toAdd.count} />
      <button on:click={addSweet}>Add new sweet</button>
    </div>
    <div>
      <input placeholder="Name" bind:value={toDelete.name} />
      <button on:click={deleteSweet}>Delete sweet</button>
    </div>
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
