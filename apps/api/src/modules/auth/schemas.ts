import { authResponseSchema, authUserSchema, loginRequestSchema, registerRequestSchema } from "@rotor/contracts";

export const registerRouteSchemas = {
  body: registerRequestSchema,
  response: authResponseSchema,
};

export const loginRouteSchemas = {
  body: loginRequestSchema,
  response: authResponseSchema,
};

export const meRouteSchemas = {
  response: authUserSchema,
};
