import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const registerSchema = z.object({
  username: z.string().min(3, "common.usernameMinLength"),
  email: z.string().email("common.invalidEmailAddress"),
  password: z.string().min(6, "common.passwordMinLength"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormInputs) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      toast({
        title: t("common.registrationSuccessful"),
        description: `${t("common.welcome")}, ${data.user.username}! ${t("common.accountCreated")}`,
      });
      navigate("/profile"); // Redirect to profile or dashboard after registration
    },
    onError: (error: any) => {
      toast({
        title: t("common.registrationFailed"),
        description: error.message || t("common.anErrorOccurred"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="reg-username">{t("common.username")}</Label>
        <Input
          id="reg-username"
          {...form.register("username")}
          placeholder={t("common.chooseAUsername")}
          data-testid="register-username"
        />
        {form.formState.errors.username && (
          <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="reg-email">{t("common.email")}</Label>
        <Input
          id="reg-email"
          type="email"
          {...form.register("email")}
          placeholder={t("common.enterYourEmail")}
          data-testid="register-email"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="reg-password">{t("common.password")}</Label>
        <Input
          id="reg-password"
          type="password"
          {...form.register("password")}
          placeholder={t("common.chooseAPassword")}
          data-testid="register-password"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t("common.register")}
      </Button>
    </form>
  );
}
