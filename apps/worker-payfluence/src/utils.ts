export const fetchPublicKey = async (apiKey: string, environmentId: string): Promise<string> => {
  const options = {method: 'GET', headers: {Authorization: `Bearer ${apiKey}`}};

  const response = await fetch(`https://app.dynamicauth.com/api/v0/environments/${environmentId}/keys`, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch public key: ${response.statusText}`);
  }

  const data: any = await response.json();

  console.log(data)

  return data.key.publicKey;
}

export const fetchJWK = async (apiKey: string, environmentId: string): Promise<any> => {
  const options = {method: 'GET', headers: {Authorization: `Bearer ${apiKey}`}};

  const response = await fetch(`https://app.dynamic.xyz/api/v0/sdk/${environmentId}/.well-known/jwks`, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch JWK: ${response.statusText}`);
  }

  const data: any = await response.json();

  console.log(data)

  return data;
}