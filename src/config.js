export default {
  WEBTASK_URL: 'https://wt-3813509ac17c9510b51327bf46eced2a-0.sandbox.auth0-extend.com/quiz-server',
  decode: encodedStr => {
    // const parser = new DOMParser();
    // const dom = parser.parseFromString('<!doctype html><body>' + encodedStr, 'text/html');
    return decodeURIComponent(encodedStr);
  }
};
