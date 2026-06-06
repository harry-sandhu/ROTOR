import { hash, compare } from "bcryptjs";

import type { AuthResponse } from "@rotor/contracts";
import type { DbClient, UserRole } from "@rotor/db";

import { conflict, unauthorized } from "../../lib/errors.js";
import { findUserByEmail, findUserById, createUser } from "./repository.js";

interface JwtSigner {
  sign(payload: { sub: string; email: string; role: UserRole }, options?: { expiresIn: string }): string;
}

function createTokens(jwt: JwtSigner, user: { id: string; email: string; role: UserRole }) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: jwt.sign(payload, { expiresIn: "1h" }),
    refreshToken: jwt.sign(payload, { expiresIn: "7d" }),
  };
}

export async function registerUser(
  db: DbClient,
  jwt: JwtSigner,
  input: { email: string; password: string; displayName: string },
): Promise<AuthResponse> {
  const existingUser = await findUserByEmail(db, input.email);

  if (existingUser) {
    throw conflict("EMAIL_IN_USE", "A user with this email already exists.");
  }

  const passwordHash = await hash(input.password, 10);
  const user = (await createUser(db, {
    email: input.email,
    passwordHash,
    displayName: input.displayName,
    role: "USER",
  }))!;

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    tokens: createTokens(jwt, user),
  };
}

export async function loginUser(
  db: DbClient,
  jwt: JwtSigner,
  input: { email: string; password: string },
): Promise<AuthResponse> {
  const user = await findUserByEmail(db, input.email);

  if (!user) {
    throw unauthorized("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const passwordMatches = await compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw unauthorized("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    tokens: createTokens(jwt, user),
  };
}

export async function getCurrentUser(db: DbClient, userId: string) {
  const user = await findUserById(db, userId);

  if (!user) {
    throw unauthorized("AUTH_REQUIRED", "Authenticated user no longer exists.");
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}
