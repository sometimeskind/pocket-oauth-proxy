const request = require("superagent");
const qs = require("querystring");

async function fetchAccessToken(clientId, requestToken) {
  const { body } = await request
    .post("https://getpocket.com/v3/oauth/authorize")
    .send({
      code: requestToken,
      consumer_key: clientId
    });

  if (!body || !body.access_token) {
    throw new Error("Invalid response for access token");
  }

  return {
    accessToken: body.access_token,
    username: body.username
  };
}

module.exports = async function oAuthCallback(req, res) {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = [];

      req.on("data", chunk => {
        data.push(chunk);
      });

      req.on("end", () => {
        try {
          const stringData = Buffer.concat(data).toString();
          const parsedData = qs.parse(stringData);
          resolve(parsedData);
        } catch (err) {
          reject(err);
        }
      });
    });

    const { code: requestToken, client_id: clientId } = body;

    if (!clientId || !requestToken) {
      const invalidError = new Error("Invalid request");
      invalidError.status = 400;
      throw invalidError;
    }

    const { accessToken, username } = await fetchAccessToken(
      clientId,
      requestToken
    );

    const responseData = JSON.stringify({
      access_token: accessToken,
      username
    });

    res.writeHead(200, { "Content-type": "application/json" });
    res.write(responseData);
    res.end();
  } catch (err) {
    res.writeHead(err.status || 500);
    res.write(err.message);
    res.end();
  }
};
