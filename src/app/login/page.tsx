import { AuthForm } from "@/components/app/auth-form";
import { MobileShell } from "@/components/app/mobile-shell";

export default function LoginPage() {
  return (
    <MobileShell showNav={false}>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col justify-center">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#6c7d72]">CalAI Copy</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Entrar</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">
            Usa email y contrasena para guardar comidas, objetivos y correcciones.
          </p>
        </div>
        <AuthForm />
      </div>
    </MobileShell>
  );
}
