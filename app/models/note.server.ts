import { nanoid } from 'nanoid'
import {FireStoreParser} from '../utils';

import type {FireStoreResponseDocument} from '../utils';

import type { User } from './user.server';

const FIREBASE_PROJECT_ID = "fir-eats-7b463";
const FIREBASE_NOTES_COLLECTION = "user-notes";
const FIREBASE_FIRESTORE_DATABASES_ENDPOINT = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIREBASE_NOTES_COLLECTION}`;
const key = `?key=${process.env.FIREBASE_API_KEY}`

// Path in which the notes are stored
// user-notes/<userId>/notes/<notesId>

export type Note = {
  id: string;
  title: string;
  body: string;
  createTime: string;
  updateTime: string;
}

export async function getNote({
  id,
  userId,
}: {
  id: string;
  userId: User["id"];
}) {
  const res = await fetch(`${FIREBASE_FIRESTORE_DATABASES_ENDPOINT}/${userId}/notes/${id}${key}`);
  const result = await res.json();
  const doc = FireStoreParser(result);
  return doc && doc?.error ? null : { ...doc, ...doc['fields']}
}

export async function getNoteListItems({ userId }: { userId: User["id"] }) {
  const res = await fetch(`${FIREBASE_FIRESTORE_DATABASES_ENDPOINT}/${userId}/notes${key}`);
  const result: {documents: FireStoreResponseDocument[]} = await res.json();

  const parsedValues = FireStoreParser(result.documents);
  
  const notes: Note[] = parsedValues.map((doc: FireStoreResponseDocument) => ({ ...doc, ...doc['fields']}));
  return notes;
}

export async function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  const uuid = nanoid();
  const res = await fetch(`${FIREBASE_FIRESTORE_DATABASES_ENDPOINT}/${userId}/notes/${key}&documentId=${uuid}`, {
    method: "POST",
    body: JSON.stringify({
      "fields": {
        "id": {
          "stringValue": uuid
        },
        "title": {
          "stringValue": title
        },
        "body": {
          "stringValue": body
        }
      }
    })
  });

  const result = await res.json();
  const doc = FireStoreParser(result);
  return { ...doc, ...doc['fields']};
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return fetch(`${FIREBASE_FIRESTORE_DATABASES_ENDPOINT}/${userId}/notes/${id}${key}`, {
    method: 'DELETE'
  });
}
