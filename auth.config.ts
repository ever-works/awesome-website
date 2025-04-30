import type { NextAuthConfig } from "next-auth";
import { providers } from "./lib/auth/providers";

// Notice this is only an object, not a full Auth.js instance
export default {
  trustHost: true,
  providers: providers,
} satisfies NextAuthConfig;
