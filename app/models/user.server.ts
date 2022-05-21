import invariant from "tiny-invariant";

invariant(process.env.FIREBASE_API_KEY, "SESSION_SECRET must be set");

const FIREBASE_ENDPOINT = "https://identitytoolkit.googleapis.com/v1/";
const FIREBASE_DOMAIN = "accounts";
const FIREBASE_SIGNUP_ACTION = "signUp";
const FIREBASE_SIGNIN_ACTION = "signInWithPassword";
const FIREBASE_LOOKUP_USER = "lookup"

const FIREBASE_SIGNUP_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_SIGNUP_ACTION}?key=${process.env.FIREBASE_API_KEY}`;
const FIREBASE_SIGNIN_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_SIGNIN_ACTION}?key=${process.env.FIREBASE_API_KEY}`;
const FIREBASE_LOOKUP_URL = `${FIREBASE_ENDPOINT}${FIREBASE_DOMAIN}:${FIREBASE_LOOKUP_USER}?key=${process.env.FIREBASE_API_KEY}`;

export type User = {
  kind: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: number;
  id: string;
}

export async function getUserByIdToken(idToken: string) {
  const res = await fetch(FIREBASE_LOOKUP_URL, { method: "POST", body: JSON.stringify({idToken: idToken}) });
  const lookup: {users: User[]} = await res.json();
  return (lookup && lookup?.users?.[0]) ? {id: lookup.users[0].localId, email: lookup.users[0].email, localId: lookup.users[0].localId} : null;
}

export async function createUser(email: User["email"], password: string) {
  const res = await fetch(FIREBASE_SIGNUP_URL, { method: "POST", body: JSON.stringify({ email, password, returnSecureToken:true }) });
  return await res.json();
}

export async function deleteUserByEmail(email: User["email"]) {
  //TODO implement delteuser by Id this is only user by cypress tests
  return [];
}

export async function verifyLogin(
  email: string,
  password: string
) {

  // The post request to Firebase return the following
  //{
  //   kind: 'identitytoolkit#VerifyPasswordResponse',
  //   localId: 'nNi0TYd1hbNYNOgAh80iBXXe2G3',
  //   email: 'email@example.com',
  //   displayName: '',
  //   idToken: <Access Token>',
  //   registered: true,
  //   refreshToken: <Refresh Token>,
  //   expiresIn: '3600'
  // }

  const res = await fetch(FIREBASE_SIGNIN_URL, { method: "POST", body: JSON.stringify({email, password, returnSecureToken:true}) });
  const user = await res.json();

  if (user && user.error) {
    return null;
  }

  return user;
}
