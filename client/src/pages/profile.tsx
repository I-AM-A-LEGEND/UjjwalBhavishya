import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [language, setLanguage] = useState("en"); // TODO: Load initial language from user profile
  const { toast } = useToast();

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      // TODO: Replace 'user1' with actual authenticated user ID
      const response = await apiRequest("PUT", `/api/profile/user1/language`, { language: newLanguage });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Language Preference Updated",
        description: `Your preferred language has been set to ${language}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Language",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveLanguage = () => {
    updateLanguageMutation.mutate(language);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">
              Update your personal information to get better scheme recommendations
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Language Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <LanguageSelector onSelect={setLanguage} currentLanguage={language} />
              <Button onClick={handleSaveLanguage}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
