import * as z from "zod"

export const loginSchema = z.object({
  email: z.email({ message: "Correo electrónico inválido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
  tenant: z.string().min(1, { message: "El tenant es requerido" }),
})

export type LoginSchema = z.infer<typeof loginSchema>
