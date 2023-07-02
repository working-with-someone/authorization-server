interface params {
  [key: string]: string | undefined;
}

function generateURL(url: string, params?: params): string {
  if (!params) {
    return url;
  }

  return `${url}?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;
}

export { generateURL };
