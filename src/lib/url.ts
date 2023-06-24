interface params {
  [key: string]: string | undefined;
}

function generateURL(url: string, params: params): string {
  return `${url}?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;
}

export { generateURL };
