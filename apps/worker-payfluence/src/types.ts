import * as yup from 'yup';

// airdrops

// export const CreateCheckout = yup.object({
//   productId: yup.string().required(),
//   // optional checkout pre-fill
//   email: yup.string().email(),
//   name: yup.string(),
// });

// public

export const CreateAirdropSignature = yup.object({
  walletAddress: yup.string().required(),
  loginToken: yup.string().required(),
});
