import {z} from "zod";
export const validateLogin = z.object({
    email: z.string("Email is required")
        .trim()
        .email("Email is not valid"),
    password: z.string("Password is required")
       ,
})