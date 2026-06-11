import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";

const trusted_origins = process.env.TRUSTED_ORIGINS?.split(',') || [];
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: { 
        enabled: true, 
    }, 
    trusted_origins,
    url: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    advanced : {
        cookies : {
            session_token : {
                name : 'session_token',
                attributes : {
                    httpOnly : true,
                    secure : process.env.NODE_ENV === 'production',
                    sameSite : 'none',
                    path : '/'
                }
            }
        }
    }
});