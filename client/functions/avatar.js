const fetch = require('node-fetch');

const FALLBACK =
  'https://api.adorable.io/avatars/face/eyes7/nose6/mouth5/8e8895/40';

exports.handler = async function (context, event, callback) {
  const { username } = event;
  const devApi = `https://dev.to/api/users/by_username?url=${username}`;

  const resp = new Twilio.Response();

  if (username === '<anon>') {
    resp.setStatusCode(307);
    resp.appendHeader('Location', FALLBACK);
    return callback(null, resp);
  }

  try {
    const devResponse = await (await fetch(devApi)).json();

    const profileImage = devResponse.profile_image
      .replace('h_320', 'h_40')
      .replace('w_320', 'w_40');

    resp.setStatusCode(301);
    resp.appendHeader('Location', profileImage);
  } catch (err) {
    resp.setStatusCode(307);
    resp.appendHeader('Location', FALLBACK);
  }
  callback(null, resp);
};
