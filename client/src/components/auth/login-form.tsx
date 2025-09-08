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

const loginSchema = z.object({
  username: z.string().min(1, "common.usernameRequired"),
  password: z.string().min(1, "common.passwordRequired"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormInputs) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      authLogin(data.user, data.token);
      toast({
        title: t("common.loginSuccessful"),
        description: `${t("common.welcome")}, ${data.user.username}!`,
      });
      navigate("/profile"); // Redirect to profile or dashboard after login
    },
    onError: (error: any) => {
      toast({
        title: t("common.loginFailed"),
        description: error.message || t("common.invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">{t("common.username")}</Label>
        <Input
          id="username"
          {...form.register("username")}
          placeholder={t("common.enterYourUsername")}
          data-testid="login-username"
        />
        {form.formState.errors.username && (
          <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">{t("common.password")}</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder={t("common.enterYourPassword")}
          data-testid="login-password"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("common.login")}
          </>
        ) : (
          t("common.login")
        )}
      </Button>
    </form>
  );
}
