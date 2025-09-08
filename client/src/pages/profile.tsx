import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const { t, i18n } = useTranslation();

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      if (!user?.id) throw new Error("User not authenticated.");
      const response = await apiRequest("PUT", `/api/profile/${user.id}/language`, { language: newLanguage });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("common.languagePreferenceUpdated"),
        description: t("common.yourPreferredLanguageHasBeenSet"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.failedToUpdateLanguage"),
        description: `${t("common.error")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveLanguage = () => {
    updateLanguageMutation.mutate(i18n.language);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("common.myProfile")}</h1>
            <p className="text-muted-foreground">
              {user ? t("common.updateYourPersonalInformation") : t("common.loginOrRegisterToManageProfile")}
            </p>
          </div>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>{activeTab === "login" ? t("common.login") : t("common.register")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t("common.login")}</TabsTrigger>
                  <TabsTrigger value="register">{t("common.register")}</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("common.personalInformation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm userId={user.id} />
              </CardContent>
            </Card>


          </>
        )}
      </div>
    </div>
  );
}
