import localforage from "localforage";
import * as jose from "jose";
import moment from "moment";

async function getOrCreateCryptoKey(
  path = "contributor-keys",
  is_public = false
) {
  let storage = await localforage.getItem(path);
  if (storage) {
    let key = await crypto.subtle.importKey(
      "jwk",
      storage[is_public ? "public" : "private"],
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      // NOTE: public/private key must these specifically, kind of annoying
      [is_public ? "verify" : "sign"]
    );
    return key;
  } else {
    let keys = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
    let pub = await crypto.subtle.exportKey("jwk", keys.publicKey);
    let pvt = await crypto.subtle.exportKey("jwk", keys.privateKey);
    // store both keys
    await localforage.setItem(path, {
      public: pub,
      private: pvt,
    });
    // read the keys from storage now
    return await getOrCreateCryptoKey(path, is_public);
  }
}

async function getOrCreateJWKRaw(path = "contributor-keys", is_public = false) {
  // There are quite a few reads if the key doesn't exist, but this layered
  // approach should make sense.
  let storage = await localforage.getItem(path);
  if (storage) {
    return storage[is_public ? "public" : "private"];
  } else {
    // create the key and ignore the output
    await getOrCreateCryptoKey(path, is_public);
    return await getOrCreateJWK(path, is_public);
  }
}

async function getOrCreateJWK(path = "contributor-keys", is_public = false) {
  return await jose.importJWK(getOrCreateJWKRaw(path, is_public), "ES256");
}

async function getThumbprint() {
  let public_jwk = await getOrCreateJWKRaw("contributor-keys", true);
  return await jose.calculateJwkThumbprint(public_jwk);
}

async function requestUploadToken() {
  let private_jwk = await getOrCreateJWK("contributor-keys", false);
  let public_jwk = await getOrCreateJWK("contributor-keys", true);

  // include the timestamp and the key fingerprint
  let data = {
    timestamp: moment().format(),
    // 32 bit string?
    thumbprint: await getThumbprint(),
  };
  let sig = await new jose.SignJWT(JSON.stringify(data)).sign(private_jwk);
  let resp = await fetch("/api/v1/token", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_key: public_jwk.toJSON(),
      signed_data: sig,
    }),
    method: "post",
  });
  return await resp.json();
}

function pubjwk(jwk) {
  const { d, p, q, dp, dq, qi, ext, alg, ...publicJwk } = jwk;
  return { ...publicJwk };
}

async function signMessage(message) {
  let private_jwk = await getOrCreateJWK("contributor-keys", false);

  let sig = await new jose.GeneralSign(new TextEncoder().encode(message))
    .addSignature(private_jwk)
    .setProtectedHeader({
      alg: "ES256",
      jwk: pubjwk(await jose.exportJWK(private_jwk)),
      typ: "jwk+json",
    })
    .sign();
  return sig;
}

async function verifyMessage(message) {
  const { payload, protectedHeader } = await jose.generalVerify(
    message,
    jose.EmbeddedJWK
  );
  let data = {
    payload: new TextDecoder().decode(payload),
    thumbprint: await jose.calculateJwkThumbprint(protectedHeader.jwk),
  };
  console.log(data);
  return data;
}

export {
  getOrCreateJWK,
  getOrCreateJWKRaw,
  requestUploadToken,
  getThumbprint,
  signMessage,
  verifyMessage,
};
