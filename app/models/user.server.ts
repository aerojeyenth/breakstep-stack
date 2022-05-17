import type { User } from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

invariant(process.env.FIREBASE_API_KEY, "SESSION_SECRET must be set");

const FIREBASE_ENDPOINT = "https://identitytoolkit.googleapis.com/v1/";
const FIREBASE_DOMAIN = "accounts";
const FIREBASE_SIGNUP_ACTION = "signUp";
const FIREBASE_SIGNIN_ACTION = "signInWithPassword";
const FIREBASE_LOOKUP_USER = "lookup"

const FIREBASE_SIGNUP_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_SIGNUP_ACTION}?key=${process.env.FIREBASE_API_KEY}`;
const FIREBASE_SIGNIN_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_SIGNIN_ACTION}?key=${process.env.FIREBASE_API_KEY}`;
const FIREBASE_LOOKUP_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_LOOKUP_USER}?key=${process.env.FIREBASE_API_KEY}`;

export type { User } from "@prisma/client";

export async function getUserByIdToken(idToken: string) {
  const res = await fetch(FIREBASE_LOOKUP_URL, { method: "POST", body: JSON.stringify({idToken: idToken}) });
  const user = await res.json();
  return (user && user.users[0]) ? {id: user.users[0].localId, email: user.users[0].email} : null;
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const res = await fetch(FIREBASE_SIGNUP_URL, { method: "POST", body: JSON.stringify({ email, password, returnSecureToken:true }) });
  return await res.json();
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: string,
  password: string
) {

  const res = await fetch(FIREBASE_SIGNIN_URL, { method: "POST", body: JSON.stringify({email, password, returnSecureToken:true}) });
  const user = await res.json();

  if (user && user.error) {
    return null;
  }

  return user;
}
