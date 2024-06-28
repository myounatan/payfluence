// neynar api

import { TipEngine } from "./types";

export const getUserAccountAge = async (neynarAPIKey: string, fid: string): Promise<{signUpDate: Date, ageInDays: number}> => {
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

  // get the days since the oldest timestamp
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - oldestTimestamp.getTime());

  return { signUpDate: oldestTimestamp, ageInDays: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) };
}

export const getUserPopularCasts = async (neynarAPIKey: string, fid: string): Promise<{reactionScore: number, numCasts: number, hasPowerBadge: boolean, verifiedEthAddresses: string[]}> => {
  const url = `https://api.neynar.com/v2/farcaster/feed/user/${fid}/popular?viewer_fid=3`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: neynarAPIKey}
  };

  const result = await fetch(url, options)
  const data: any = await result.json()

  // loop through data.casts and sum the reactions
  const totalReactions = {
    likes: 0,
    recasts: 0,
    replies: 0,
  };

  data.casts.forEach((cast: any) => {
    totalReactions.likes += cast.reactions.likes_count;
    totalReactions.recasts += cast.reactions.recasts_count;
    totalReactions.replies += cast.replies.count;
  });

  const hasPowerBadge = data.casts[0]?.author?.power_badge

  // score is the sum of all reactions divided by the number of casts
  // recasts are worth x5, replies are worth x3
  return {
    reactionScore: Math.ceil((totalReactions.likes + totalReactions.recasts * 5 + totalReactions.replies * 3) / data.casts.length),
    numCasts: data.casts.length,
    hasPowerBadge: hasPowerBadge ? true : false,
    verifiedEthAddresses: data.casts[0]?.author?.verified_addresses?.eth_addresses || []
  }
}

// cloudflare worker

export const fetchDailyAllowance = async (endpoint: string, fid: string): Promise<number> => {
  const options = {method: 'GET', headers: {accept: 'application/json'}};

  const response = await fetch(`${endpoint}/${fid}`, options);

  const data: any = await response.json();

  console.log(data)

  return data.allowance;
}

// webhook creation

export const createNeynarWebhook = async (neynarAPIKey: string, webhookUrl: string, tipEngineId: string, tipString: string) => {

  const strippedTipString = tipString.substring(1);

  const url = 'https://api.neynar.com/v2/farcaster/webhook';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: neynarAPIKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      subscription: {'cast.created': {text: `\$(${strippedTipString.toUpperCase}|${strippedTipString.toLowerCase()})`}},
      name: tipEngineId,
      url: webhookUrl
    })
  };
  
  const response = await fetch(url, options)

  if (response.status !== 200) {
    console.log("neynar webhook creation failed")
    throw Error("Webhook creation failed")
  }

  console.log("neynar webhook created")
  console.log(await response.json())

  return await response.json();
}

export const deleteNeynarWebhook = async (neynarAPIKey: string, webhookId: string): Promise<boolean> => {
  const url = 'https://api.neynar.com/v2/farcaster/webhook';
  const options = {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      api_key: neynarAPIKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({webhook_id: webhookId})
  };

  const response = await fetch(url, options)

  return response.status === 200 ? true : false;
}