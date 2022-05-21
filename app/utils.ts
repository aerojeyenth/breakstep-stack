import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}


export type MapValue = {
  "fields": {[key: string]: FirestoreObject}
}

export type LatLng = {
  "latitude": number;
  "longitude": number
}

export type ArrayValue = {
  "values": FirestoreObject[]
}

export type FirestoreObject = {
  [key in "stringValue" | "integerValue" | "booleanValue" | "nullValue" | "doubleValue" | "timestampValue" | "arrayValue" | "bytesValue" | "referenceValue" | "geoPointValue" | "arrayValue" | "mapValue"]: string | number | boolean | null | LatLng | ArrayValue | MapValue;
};

export type FireStoreResponseDocument = {
  name: string;
  fields: {[key: string]: FirestoreObject},
  createTime: string;
  updateTime: string;
  error?: any;
}

const getFireStoreProp = (value: FireStoreResponseDocument[]) => {
  const props = { 'arrayValue': 1, 'bytesValue': 1, 'booleanValue': 1, 'doubleValue': 1, 'geoPointValue': 1, 'integerValue': 1, 'mapValue': 1, 'nullValue': 1, 'referenceValue': 1, 'stringValue': 1, 'timestampValue': 1 }
  return Object.keys(value).find(k => props[k] === 1)
}

export const FireStoreParser = (value: FireStoreResponseDocument[]) => {
  if(!value) return [];
  const prop = getFireStoreProp(value)
  if (prop === 'doubleValue' || prop === 'integerValue') {
    value = Number(value[prop])
  }
  else if (prop === 'arrayValue') {
    value = (value[prop] && value[prop].values || []).map(v => FireStoreParser(v))
  }
  else if (prop === 'mapValue') {
    value = FireStoreParser(value[prop] && value[prop].fields || {})
  }
  else if (prop === 'geoPointValue') {
    value = { latitude: 0, longitude: 0, ...value[prop] }
  }
  else if (prop) {
    value = value[prop]
  }
  else if (typeof value === 'object') {
    Object.keys(value).forEach(k => value[k] = FireStoreParser(value[k]))
  }
  return value;
}
