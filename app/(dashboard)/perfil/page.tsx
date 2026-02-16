"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Phone, Mail, Camera, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { usersService, type UpdateUserRequest, type UserDto } from "@/features/users/services/users.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const profileSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").max(100),
  lastName: z.string().min(1, "El apellido es obligatorio").max(100),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: z.string().min(10, "Mínimo 10 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const authFromStore = () => {
  const token = useAuthStore.getState().accessToken;
  const tenant = useAuthStore.getState().user?.tenant ?? "root";
  return token ? { accessToken: token, tenant } : undefined;
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const fileRef = useRef<HTMLInputElement>(null);
  const auth = authFromStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profileData, setProfileData] = useState<UserDto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [showCurPw, setShowCurPw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [error, setError] = useState("");

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "" },
  });

  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await usersService.getProfile(auth);
        setProfileData(data);
        profileForm.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phoneNumber: data.phoneNumber ?? "",
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken, tenant]);

  const initials = (() => {
    const f = profileForm.watch("firstName");
    const l = profileForm.watch("lastName");
    return ((f?.[0] || "") + (l?.[0] || "")).toUpperCase() || (user?.name?.[0] || "U");
  })();

  const displayAvatar = removeAvatar ? null : previewUrl || profileData?.imageUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Archivo muy grande. Máximo 2MB.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Formato no soportado. Solo JPG y PNG.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setError("");
  };

  const fileToBase64 = (file: File): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        resolve(bytes);
      };
      reader.onerror = reject;
    });
  };

  const onSaveProfile = async (data: ProfileForm) => {
    if (!auth || !profileData?.id) return;
    setSaving(true);
    setError("");
    try {
      let imageData: { fileName: string; contentType: string; data: number[] } | undefined;

      if (removeAvatar) {
        // Delete avatar
      } else if (selectedFile) {
        const bytes = await fileToBase64(selectedFile);
        imageData = {
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          data: bytes,
        };
      }

      const updateData: UpdateUserRequest = {
        id: profileData.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || null,
        email: null, // Email no se puede cambiar
        image: imageData,
        deleteCurrentImage: removeAvatar,
      };

      await usersService.updateProfile(updateData, auth);
      
      // Recargar perfil para obtener imagen actualizada
      const updated = await usersService.getProfile(auth);
      setProfileData(updated);
      setSelectedFile(null);
      setPreviewUrl(null);
      setRemoveAvatar(false);
      setError("");
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { errors?: string[]; detail?: string } } }).response?.data
        : undefined;
      if (Array.isArray(res?.errors) && res.errors.length > 0) {
        setError(res.errors.join(". "));
      } else if (res?.detail) {
        setError(res.detail);
      } else {
        setError("Error al actualizar el perfil");
      }
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setError("");
    // TODO: Implementar cambio de contraseña cuando el endpoint esté disponible
    setChangingPw(true);
    try {
      // Por ahora mostrar error ya que no hay endpoint específico para cambiar contraseña del perfil
      setError("El cambio de contraseña no está disponible aún");
    } catch (err: unknown) {
      setError("Error al cambiar la contraseña");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tu información personal y seguridad.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu nombre y datos de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" {...profileForm.register("firstName")} />
                {profileForm.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" {...profileForm.register("lastName")} />
                {profileForm.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Teléfono
              </Label>
              <Input
                id="phoneNumber"
                {...profileForm.register("phoneNumber")}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Correo electrónico
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] text-xs">
                    El email no se puede cambiar por seguridad. Contacta con soporte si necesitas
                    actualizarlo.
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                value={profileData?.email || user?.email || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Avatar Section */}
            <div className="border-t border-border pt-4 mt-4">
              <Label className="flex items-center gap-1.5 mb-3">
                <Camera className="h-3.5 w-3.5" /> Foto de Perfil
              </Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {displayAvatar ? (
                    <AvatarImage src={displayAvatar} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Seleccionar imagen
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {(profileData?.imageUrl || previewUrl) && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="removeAvatar"
                        checked={removeAvatar}
                        onCheckedChange={(v) => {
                          setRemoveAvatar(!!v);
                          if (v) {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }
                        }}
                      />
                      <Label
                        htmlFor="removeAvatar"
                        className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar foto actual
                      </Label>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                JPG o PNG, máximo 2 MB.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500" /> Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurPw ? "text" : "password"}
                  {...pwForm.register("currentPassword")}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurPw((v) => !v)}
                >
                  {showCurPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPw ? "text" : "password"}
                  {...pwForm.register("newPassword")}
                  placeholder="Mínimo 10 caracteres"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfPw ? "text" : "password"}
                  {...pwForm.register("confirmPassword")}
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfPw((v) => !v)}
                >
                  {showConfPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPw} className="bg-amber-500 hover:bg-amber-600 text-white">
                {changingPw ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
