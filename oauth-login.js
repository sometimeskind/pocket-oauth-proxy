const request = require("superagent");
const qs = require("querystring");

async function fetchRequestToken(clientId, redirectUri, state = "") {
  const { body } = await request
    .post("https://getpocket.com/v3/oauth/request")
    .send({
      consumer_key: clientId,
      redirect_uri: redirectUri,
      state: state
    });

  if (!body || !body.code) {
    throw new Error("Invalid response for request token");
  }

  return body.code;
}

module.exports = async function oAuthLogin(req, res) {
  try {
    const [, queryString = ""] = req.url.split("?");

    const query = qs.parse(queryString);

    const { client_id: clientId, redirect_uri: redirectUri, state } = query;

    if (!clientId || !redirectUri) {
      const invalidError = new Error("Invalid request");
      invalidError.status = 400;
      throw invalidError;
    }

    const requestToken = await fetchRequestToken(clientId, redirectUri, state);

    const redirectUrlQuery = qs.stringify({
      code: requestToken,
      state
    });

    const redirectQuery = qs.stringify({
      redirect_uri: `${redirectUri}?${redirectUrlQuery}`,
      request_token: requestToken
    });

    res.writeHead(301, {
      Location: `https://getpocket.com/auth/authorize?${redirectQuery}`
    });
    res.end();
  } catch (err) {
    res.writeHead(err.status || 500);
    res.write(err.message);
    res.end();
  }
};
