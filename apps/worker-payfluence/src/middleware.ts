import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import { createMiddleware } from "hono/factory";
import * as jose from 'jose'

export const walletAuth = createMiddleware(async (c, next) => {
  const walletSignature = c.req.header("X-Wallet-Signature")
  const wallet = c.req.header("X-Wallet-Address")

  if (walletSignature && wallet) {
    // message that was signed by the wallet is "X-Wallet-Signature"
    const address = await recoverPersonalSignature({
      data: Buffer.from("X-Wallet-Signature", "utf8"),
      signature: walletSignature
    });
    const walletSignatureValid = address.toString().toLowerCase() === wallet.toLowerCase();

    console.log("extracted address", address)
    console.log("given address", wallet)
    console.log("Wallet Signature Valid", walletSignatureValid)

    if (walletSignatureValid) {
      // trust the user signed the wallet address
      c.set('walletAddress' as never, wallet)
    }
  }

  await next()
})

export const dynamicAuth = createMiddleware(async (c, next) => {
  const bearerToken = c.req.header('Authorization')
  if (!bearerToken) {
    return new Response("Unauthorized, missing bearer token", { status: 401 })
  }

  const alg = 'RS256'
  const spki = c.env.DYNAMIC_XYZ_PUBLIC_KEY
  const publicKey = await jose.importSPKI(spki, alg)
  const jwt = bearerToken.split(' ')[1]
    
  const result: any = await jose.jwtVerify(jwt, publicKey, {})
  
  // console.log(protectedHeader)
  console.log(result.payload)

  // add email to context

  const email: string = result.payload.verified_credentials[0].email
  c.set('email' as never, email)

  await next()
});
