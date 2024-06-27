// neynar api

export const getUserCreatedDate = async (neynarAPIKey: string, fid: string): Promise<Date> => {
  const url = `https://api.neynar.com/v2/farcaster/storage/allocations?fid=${fid}`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: neynarAPIKey}
  };

  const result = await fetch(url, options)
  const data: any = await result.json()

  // loop through allocations and find timestamp that is the oldest
  let oldestTimestamp: Date = new Date();
  data.allocations.forEach((allocation: any) => {
    const timestamp = new Date(allocation.timestamp);
    if (timestamp < oldestTimestamp) {
      oldestTimestamp = timestamp;
    }
  });

  return oldestTimestamp;
}

// cloudflare worker

export const fetchDailyAllowance = async (endpoint: string, fid: string): Promise<number> => {
  const options = {method: 'GET', headers: {accept: 'application/json'}};

  const response = await fetch(`${endpoint}/${fid}`, options);

  const data: any = await response.json();

  console.log(data)

  return data.allowance;
}
