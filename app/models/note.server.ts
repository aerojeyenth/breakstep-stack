import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return [{id: 1, title: "Staic Notes Title", body: "This is the body of the note"}];
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return [{id: 1, title: "Staic Notes Title", body: "This is the body of the note"}, {id: 2, title: "To be replaced by dynamic values from FireStore", body: "This is the body of the note"}];
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
