import queryString from 'query-string';

export const getQueryParameter = (name) => {

  var decodedString = Buffer.from(location.search, 'base64').toString('ascii');

  if (decodedString == null) {
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
