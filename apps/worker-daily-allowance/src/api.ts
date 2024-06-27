// neynar api

export const getUserAccountAgeInDays = async (neynarAPIKey: string, fid: string): Promise<number> => {
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

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const getAverageUserReactionScore = async (neynarAPIKey: string, fid: string): Promise<number> => {
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

  // score is the sum of all reactions divided by the number of casts
  // recasts are worth x5, replies are worth x3
  return Math.ceil((totalReactions.likes + totalReactions.recasts * 5 + totalReactions.replies * 3) / data.casts.length);
}
