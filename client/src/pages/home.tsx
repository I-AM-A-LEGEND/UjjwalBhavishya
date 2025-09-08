import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SchemeCard } from "@/components/schemes/scheme-card";
import { EligibilityChecker } from "@/components/schemes/eligibility-checker";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { Search, Play, Users, MapPin, Award, Accessibility } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const { data: popularSchemes = [], isLoading: schemesLoading } = useQuery({
    queryKey: ["/api/schemes/popular"],
  }) as { data: any[], isLoading: boolean };

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/schemes/categories"],
  });

  const stats = {
    totalSchemes: "1,200+",
    beneficiaries: "2.5M+",
    states: "28",
    languages: "12"
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t("common.findGovernmentSchemes")}{" "}
                <span className="text-primary">{t("common.madeForYou")}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t("common.aiPoweredPlatform")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/schemes")}
                  data-testid="button-find-schemes"
                  className="flex items-center justify-center"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t("common.findMySchemes")}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-how-it-works"
                  className="flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {t("common.howItWorks")}
                </Button>
              </div>
            </div>
            <Card className="bg-card shadow-lg">
              <CardHeader>
                <CardTitle>{t("common.quickEligibilityCheck")}</CardTitle>
              </CardHeader>
              <CardContent>
                <EligibilityChecker />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-schemes">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalSchemes}</div>
              <p className="text-muted-foreground">{t("common.governmentSchemes")}</p>
            </div>
            <div className="text-center" data-testid="stat-beneficiaries">
              <div className="text-3xl font-bold text-primary mb-2">{stats.beneficiaries}</div>
              <p className="text-muted-foreground">{t("common.beneficiaries")}</p>
            </div>
            <div className="text-center" data-testid="stat-states">
              <div className="text-3xl font-bold text-primary mb-2">{stats.states}</div>
              <p className="text-muted-foreground">{t("common.statesUTs")}</p>
            </div>
            <div className="text-center" data-testid="stat-languages">
              <div className="text-3xl font-bold text-primary mb-2">{stats.languages}</div>
              <p className="text-muted-foreground">{t("common.languages")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("common.platformFeatures")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("common.advancedAiTechnology")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Search className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Recommendations</h3>
                <p className="text-muted-foreground">
                  Machine learning algorithms analyze your socio-economic profile to suggest the most relevant schemes
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multilingual Chatbot</h3>
                <p className="text-muted-foreground">
                  Voice and text support in 12+ Indian languages for seamless interaction and guidance
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
                <p className="text-muted-foreground">
                  Track your application status and get notifications for updates and deadlines
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Data Handling</h3>
                <p className="text-muted-foreground">
                  Government-grade security for your personal and financial information
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Mobile-First Design</h3>
                <p className="text-muted-foreground">
                  Optimized for smartphones with offline capabilities for rural areas
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Accessibility className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Accessibility Compliant</h3>
                <p className="text-muted-foreground">
                  WCAG 2.1 AA compliant design for users with disabilities
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Schemes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("common.popularSchemes")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("common.discoverGovernmentSchemes")}
            </p>
          </div>
          
          {schemesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {popularSchemes.slice(0, 3).map((scheme: any) => (
                <SchemeCard 
                  key={scheme.id} 
                  scheme={scheme}
                  showEligibilityButton={true}
                  data-testid={`scheme-card-${scheme.id}`}
                />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/schemes")}
              data-testid="button-view-all-schemes"
            >
              {t("common.viewAllSchemes")}
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("common.howItWorks")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("common.simple4StepProcess") || "Simple 4-step process to discover and apply for government schemes"}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("common.profileCreation") || "Profile Creation"}</h3>
              <p className="text-muted-foreground text-sm">
                {t("common.provideSocioEconomicDetails") || "Provide your socio-economic details for personalized recommendations"}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("common.aiAnalysis") || "AI Analysis"}</h3>
              <p className="text-muted-foreground text-sm">
                {t("common.aiEngineMatches") || "Our AI engine matches you with eligible schemes based on your profile"}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("common.applyOnline") || "Apply Online"}</h3>
              <p className="text-muted-foreground text-sm">
                {t("common.submitApplications") || "Submit applications directly through our platform with guided assistance"}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t("common.trackReceive") || "Track & Receive"}</h3>
              <p className="text-muted-foreground text-sm">
                {t("common.monitorApplicationStatus") || "Monitor application status and receive benefits directly to your account"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
