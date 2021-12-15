import createAuth0Client from "@auth0/auth0-spa-js";
import { user, isAuthenticated, popupOpen, token } from "./store";
import config from "./auth-config";
import { getSplitLink } from "./apollo-service";

async function createClient() {
  return await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
  });
}

async function loginWithPopup(client, apollo, options) {
  popupOpen.set(true);
  try {
    await client.loginWithPopup(options);

    user.set(await client.getUser());
    const accessToken = await client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
      const splitLink = getSplitLink(accessToken.__raw);
      apollo.setLink(splitLink);
    }
    isAuthenticated.set(true);
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
  } finally {
    popupOpen.set(false);
  }
}

function logout(client) {
  return client.logout();
}

const auth = {
  createClient,
  loginWithPopup,
  logout,
};

export default auth;
