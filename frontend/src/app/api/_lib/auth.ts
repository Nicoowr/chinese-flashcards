import { NextResponse } from "next/server";

const ALLOWED_EMAIL = "nicolasli0893@gmail.com";

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
};

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }

  return { url, serviceRoleKey };
};

const getBearerToken = (request: Request) => {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader) {
    throw new RequestAuthError("Missing authorization header", 401);
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new RequestAuthError("Invalid authorization header", 401);
  }

  return token;
};

export class RequestAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "RequestAuthError";
  }
}

export const assertAuthorizedEmail = async (request: Request) => {
  const token = getBearerToken(request);
  const { url, serviceRoleKey } = getSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new RequestAuthError("Invalid or expired token", 401);
  }

  const user = (await response.json()) as SupabaseAuthUser;
  if (user.email?.toLowerCase() !== ALLOWED_EMAIL) {
    throw new RequestAuthError("Forbidden", 403);
  }

  return user;
};

export const toAuthErrorResponse = (error: unknown) => {
  if (!(error instanceof RequestAuthError)) {
    return null;
  }

  return NextResponse.json({ error: error.message }, { status: error.status });
};
