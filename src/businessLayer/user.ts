import { createUser as addUserToDB } from "../dataLayer/user";

export const createUser = async (id: string) => {
  await addUserToDB(id);
};