import {z} from "zod";
export const validateRegister = z.object({
    username: z.string("Username is required")
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username is too long"),
    email: z.string("Email is required")
        .trim()
        .email("Email is not valid"),
    password: z.string("Password is required")
        .min(6, "Password must be at least 6 characters long"),
    role: z.string("Role is required")
    .trim()
})