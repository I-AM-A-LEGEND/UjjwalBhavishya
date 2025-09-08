import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { LanguageSelector } from "@/components/chatbot/language-selector";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Profile() {
  const [language, setLanguage] = useState("en");

  const handleSaveLanguage = () => {
    // TODO: Save language preference to the backend
    console.log("Language preference saved:", language);
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
