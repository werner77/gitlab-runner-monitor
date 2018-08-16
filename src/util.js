import queryString from 'query-string';

export const getQueryParameter = (name) => {

  const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(location.search);

  var decodedString = null;
  if (isBase64) {
    decodedString = Buffer.from(location.search, 'base64').toString('ascii');
  } else {
    decodedString = location.search
  }

  const parsed = queryString.parse(decodedString);

  if (name in parsed) {
    let parameter = parsed[name];

    if (parameter === 'true') {
      return true;
    } else if (parameter === 'false') {
      return false;
    } else if (!isNaN(+parameter)) {
      return +parameter
    }

    return parameter;
  } else {
    return null
  }
};
