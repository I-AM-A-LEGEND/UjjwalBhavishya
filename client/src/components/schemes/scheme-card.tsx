import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertCircle, Users, FileText } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from 'react-i18next';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  ministry: string;
  state: string | null;
  benefits: string;
  maxIncome: number | null;
  applicationUrl: string | null;
  statusUrl?: string | null;
  targetCategories: string[] | null;
}

interface Recommendation {
  score: number;
  reasoning: string;
  eligibilityStatus: string;
}

interface SchemeCardProps {
  scheme: Scheme;
  recommendation?: Recommendation;
  showEligibilityButton?: boolean;
  userId?: string;
}

export function SchemeCard({ scheme, recommendation, showEligibilityButton = false, userId }: SchemeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const currentUserId = userId || user?.id;

  const checkEligibilityMutation = useMutation({
    mutationFn: async (data: { userId: string; schemeId: string }) => {
      const response = await apiRequest("POST", `/api/schemes/${data.schemeId}/check-eligibility`, {
        userId: data.userId
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.eligible ? "You are eligible!" : "Not eligible",
        description: data.eligible 
          ? `You meet ${Math.round(data.score * 100)}% of the criteria for this scheme.`
          : "You don't meet the current eligibility criteria for this scheme.",
        variant: data.eligible ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again.",
        variant: "destructive"
      });
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (data: { userId: string; schemeId: string }) => {
      const response = await apiRequest("POST", "/api/applications", {
        userId: data.userId,
        schemeId: data.schemeId,
        status: "submitted"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. You can track its status in the Applications section.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCheckEligibility = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to check eligibility.",
        variant: "destructive"
      });
      return;
    }
    checkEligibilityMutation.mutate({ userId: currentUserId, schemeId: scheme.id });
  };

  const handleApply = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to apply for schemes.",
        variant: "destructive"
      });
      return;
    }

    if (scheme.applicationUrl) {
      window.open(scheme.applicationUrl, '_blank');
    } else {
      applyMutation.mutate({ userId: currentUserId, schemeId: scheme.id });
    }
  };

  const getRecommendationColor = (status: string) => {
    switch (status) {
      case "eligible":
        return "text-green-600 bg-green-50";
      case "partially_eligible":
        return "text-yellow-600 bg-yellow-50";
      case "not_eligible":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatIncomeLimit = (amount: number | null) => {
    if (!amount) return "No limit";
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getDefaultStatusUrl = (category: string, applicationUrl: string | null): string => {
    const statusUrlMap: Record<string, string> = {
      "Agriculture": "https://pmkisan.gov.in/BeneficiaryStatus.aspx",
      "Healthcare": "https://pmjay.gov.in/search/hospital",
      "Housing": "https://pmaymis.gov.in/Track_Application_Status.aspx",
      "Banking": "https://www.pmjdy.gov.in/account",
      "Employment": "https://www.epfindia.gov.in/site_en/index.php",
      "Insurance": "https://www.jansuraksha.gov.in/",
      "Women & Child": "https://wcd.nic.in/"
    };
    return statusUrlMap[category] || applicationUrl || "https://www.myscheme.gov.in/search";
  };

  return (
    <Card className="border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with gradient */}
      <div className={`p-4 ${
        recommendation?.eligibilityStatus === "eligible" 
          ? "bg-gradient-to-r from-green-500 to-green-600" 
          : recommendation?.eligibilityStatus === "partially_eligible"
          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
          : "bg-gradient-to-r from-primary to-accent"
      }`}>
        <h3 className="text-lg font-semibold text-white mb-1" data-testid={`scheme-title-${scheme.id}`}>
          {scheme.name}
        </h3>
        <p className="text-white/80 text-sm">
          {scheme.category} • {scheme.ministry}
        </p>
        {scheme.state && (
          <p className="text-white/80 text-sm">State: {scheme.state}</p>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Recommendation Score */}
        {recommendation && (
          <div className={`mb-3 p-3 rounded-lg ${getRecommendationColor(recommendation.eligibilityStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium flex items-center">
                {recommendation.eligibilityStatus === "eligible" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {recommendation.eligibilityStatus === "eligible" ? "Highly Recommended" : "Partially Eligible"}
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round(recommendation.score * 100)}% match
              </Badge>
            </div>
            {isExpanded && (
              <p className="text-sm whitespace-pre-line">
                {recommendation.reasoning}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-muted-foreground mb-3 text-sm" data-testid={`scheme-description-${scheme.id}`}>
          {scheme.description}
        </p>

        {/* Benefits */}
        <div className="mb-3">
          <h4 className="font-medium text-sm mb-1">Benefits:</h4>
          <p className="text-sm text-muted-foreground">
            {scheme.benefits}
          </p>
        </div>

        {/* Eligibility Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {scheme.category}
            </Badge>
            {scheme.maxIncome && (
              <Badge variant="outline" className="text-xs">
                Max Income: {formatIncomeLimit(scheme.maxIncome)}
              </Badge>
            )}
            {scheme.state ? (
              <Badge variant="outline" className="text-xs">
                {scheme.state}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                All India
              </Badge>
            )}
          </div>
        </div>

        {/* Target Categories */}
        {scheme.targetCategories && scheme.targetCategories.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Eligible Categories: {scheme.targetCategories.join(", ")}
            </p>
          </div>
        )}

        {/* Show/Hide Details */}
        {recommendation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs p-0 h-auto mb-3"
            data-testid={`button-toggle-details-${scheme.id}`}
          >
            {isExpanded ? "Hide Details" : "Show AI Analysis"}
          </Button>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {showEligibilityButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckEligibility}
              disabled={checkEligibilityMutation.isPending}
              className="flex-1"
              data-testid={`button-check-eligibility-${scheme.id}`}
            >
              {checkEligibilityMutation.isPending ? "Checking..." : "Check Eligibility"}
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleApply}
            disabled={applyMutation.isPending}
            className={`${showEligibilityButton ? 'sm:col-span-1' : 'sm:col-span-2'} flex items-center justify-center`}
            data-testid={`button-apply-${scheme.id}`}
          >
            {applyMutation.isPending ? "Applying..." : "Apply Now"}
            {scheme.applicationUrl && <ExternalLink className="h-3 w-3 ml-1" />}
          </Button>
          
          {/* Application Status Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const statusUrl = scheme.statusUrl || getDefaultStatusUrl(scheme.category, scheme.applicationUrl);
              if (statusUrl) {
                window.open(statusUrl, '_blank');
              }
            }}
            className={`${showEligibilityButton ? 'sm:col-span-1' : 'sm:col-span-2'} flex items-center justify-center`}
            data-testid={`button-status-${scheme.id}`}
          >
            <FileText className="h-3 w-3 mr-1" />
            Check Status
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
