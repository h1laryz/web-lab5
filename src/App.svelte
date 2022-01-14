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
      try {
        requestCounter.update((n) => n + 1);
        const { data } = await http.fetchMyQuery(OperationDocsStore.getAll());
        requestCounter.update((n) => n - 1);
        sweets.set(data.laba3_sweets);
      } catch (e) {
        error.set("Cannot fetch data");
      }
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
    try {
      const { insert_laba3_sweets_one } = await http.startExecuteMyMutation(
        OperationDocsStore.addOne(name, price, count),
      );
      if (insert_laba3_sweets_one) {
        sweets.update((n) => [...n, insert_laba3_sweets_one]);
      }
    } catch (e) {
      error.set("Error while adding");
    }
  };

  const deleteSweet = async (id) => {
    try {
      await http.startExecuteMyMutation(OperationDocsStore.deleteById(id));
      sweets.update((n) => n.filter((sweet) => sweet.id !== id));
    } catch (e) {
      error.set("Error while deleting");
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
    <p>{$requestCounter}</p>
  {:else if $sweets.error || $error}
    <h1>{JSON.stringify($sweets.error) || $error}</h1>
  {:else}
    <button on:click={logout}>Log out</button>
    <div>
      <input placeholder="Name" bind:value={toAdd.name} />
      <input placeholder="Price" bind:value={toAdd.price} />
      <input placeholder="Count" bind:value={toAdd.count} />
      <button on:click={addSweet}>Add new sweet</button>
    </div>
    {#if $sweets.length}
      {#each $sweets as sweet (sweet.id)}
        <div class="sweetItem">
          <p>Name: {sweet.name}</p>
          <p>Price: {sweet.price}</p>
          <p>Count: {sweet.count}</p>
          <button on:click={() => deleteSweet(sweet.id)}>Delete sweet</button>
        </div>
      {/each}
    {:else}
      <h1>Nothing to show</h1>
    {/if}
  {/if}
</main>

<style>
  :root {
    --black: #000;
  }
  main {
    margin: 0;
    padding: 0;
  }
  .sweetItem {
    border: 1px solid var(--black);
    margin: 10px;
    padding: 10px;
  }
</style>
