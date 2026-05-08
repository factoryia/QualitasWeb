"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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
                    <div className="relative">
                      <Building2
                        className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <Input
                        placeholder="mi-organizacion"
                        className="h-11 border-slate-200/90 bg-sky-50/35 pl-10 transition-colors focus-visible:bg-white"
                        {...field}
                      />
                    </div>
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
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <Input
                      placeholder="m@ejemplo.com"
                      type="email"
                      autoComplete="email"
                      className="h-11 border-slate-200/90 bg-sky-50/35 pl-10 transition-colors focus-visible:bg-white"
                      {...field}
                    />
                  </div>
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
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      autoComplete="********"
                      className="h-11 border-slate-200/90 bg-sky-50/35 pl-10 pr-12 transition-colors focus-visible:bg-white"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100/90 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-[18px]" strokeWidth={2} />
                      ) : (
                        <Eye className="size-[18px]" strokeWidth={2} />
                      )}
                    </button>
                  </div>
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
            className="h-12 w-full rounded-xl bg-linear-to-b from-[#5490f1] to-[#0757d8] font-semibold text-white shadow-md shadow-blue-500/25 transition-colors duration-300 hover:to-[#276cdb]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 size-[18px] animate-spin" aria-hidden />
            )}
            Iniciar Sesión
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
