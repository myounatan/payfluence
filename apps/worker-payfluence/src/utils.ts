export const fetchPublicKey = async (apiKey: string, environmentId: string): Promise<string> => {
  const options = {method: 'GET', headers: {Authorization: `Bearer ${apiKey}`}};

  const response = await fetch(`https://app.dynamicauth.com/api/v0/environments/${environmentId}/keys`, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch public key: ${response.statusText}`);
  }

  const data: any = await response.json();

  return data.key.publicKey;
}