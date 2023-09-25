const IS = {
  isObject: v => v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v),
  isString: v => v !== null && v !== undefined && (typeof v === 'string' || v instanceof String),
  isArray: v => Array.isArray(v)
}

function uuid () {
  let text = "";

  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 7; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

module.exports = {
  IS,
  uuid
}