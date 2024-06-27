import * as yup from 'yup';

// webhook data

export const CastWebhookSchema = yup.object({
  created_at: yup.number(),
  type: yup.string(),
  data: yup.object({
    object: yup.string(),
    hash: yup.string(),
    thread_hash: yup.string(),
    parent_hash: yup.mixed().nullable(),
    parent_url: yup.mixed().nullable(),
    root_parent_url: yup.mixed().nullable(),
    parent_author: yup.object({
      fid: yup.number().nullable(),
    }),
    author: yup.object({
      object: yup.string(),
      fid: yup.number(),
      custody_address: yup.string(),
      username: yup.string(),
      display_name: yup.string(),
      pfp_url: yup.string().url(),
      profile: yup.object({
        bio: yup.object({
          text: yup.string(),
        }),
      }),
      follower_count: yup.number(),
      following_count: yup.number(),
      verifications: yup.array().of(yup.string()),
      verified_addresses: yup.object({
        eth_addresses: yup.array().of(yup.string()),
        sol_addresses: yup.array().of(yup.string()),
      }),
      active_status: yup.string(),
      power_badge: yup.boolean(),
    }),
    text: yup.string(),
    timestamp: yup.string(),
    embeds: yup.array().of(yup.mixed()), // Assuming embeds structure is not defined
    reactions: yup.object({
      likes_count: yup.number(),
      recasts_count: yup.number(),
      likes: yup.array().of(yup.mixed()), // Assuming likes structure is not defined
      recasts: yup.array().of(yup.mixed()), // Assuming recasts structure is not defined
    }),
    replies: yup.object({
      count: yup.number(),
    }),
    channel: yup.mixed().nullable(),
    mentioned_profiles: yup.array().of(yup.mixed()), // Assuming mentioned_profiles structure is not defined
  }),
});
