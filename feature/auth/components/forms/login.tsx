"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "../../api/auth";
import { permissionsApi } from "../../api/permissions";
import { loginSchema, LoginSchema } from "../../schemas";

import { useRouter } from "next/navigation";
import { readTenantSlug, rememberTenantSlug } from "../../lib/login-path";
import { useAuthStore } from "../../store/auth.store";
import { AuthLayout } from "../shared/auth-layout";

interface LoginFormProps {
  tenant?: string;
}

export function LoginForm({ tenant }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const hasTenant = !!tenant;

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenant: tenant ?? "",
    },
  });

  useEffect(() => {
    if (hasTenant) return;
    const fromStorage = readTenantSlug();
    if (fromStorage) {
      form.setValue("tenant", fromStorage);
    }
  }, [form, hasTenant]);

  async function onSubmit(values: LoginSchema) {
    setIsLoading(true);
    setError("");
    try {
      const resolvedTenant = hasTenant ? tenant : values.tenant;

      rememberTenantSlug(resolvedTenant);

      const response = await authApi.login(
        { email: values.email, password: values.password },
        resolvedTenant!,
      );

      if (!response?.accessToken || !response?.refreshToken) {
        throw new Error("Respuesta inválida del servidor");
      }

      const store = useAuthStore.getState();
      store.login(response.accessToken, response.refreshToken);

      try {
        store.setLoadingPermissions(true);
        store.setPermissionError(null);
        const permissions = await permissionsApi.getUserPermissions(
          response.accessToken,
        );
        store.setPermissions(permissions || []);
      } catch (permErr) {
        console.warn("[AUTH] Permisos no cargados:", permErr);
        store.setPermissions([]);
      } finally {
        store.setLoadingPermissions(false);
      }

      await new Promise((r) => setTimeout(r, 0));
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión. Por favor verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar Sesión"
      description={
        hasTenant
          ? `Ingresa tus credenciales para ${tenant}`
          : "Ingresa organización y credenciales para acceder a tu cuenta"
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!hasTenant && (
            <FormField
              control={form.control}
              name="tenant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant (Organización)</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-organizacion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="m@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <div className="text-sm text-red-500 font-medium text-center">
              {error}
            </div>
          )}
          <Button
            size="lg"
            className="w-full bg-linear-to-b from-[#5490f1] to-[#0757d8] hover:to-[#276cdb] transition-colors duration-300 text-white"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
