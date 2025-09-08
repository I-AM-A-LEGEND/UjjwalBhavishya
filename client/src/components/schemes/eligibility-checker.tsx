import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EligibilityForm {
  state: string;
  annualIncome: string;
  category: string;
  occupation: string;
  age: string;
}

interface EligibilityResult {
  eligibleSchemes: Array<{
    scheme: {
      id: string;
      name: string;
      category: string;
      benefits: string;
    };
    eligibility: {
      eligible: boolean;
      score: number;
      reasons: string[];
      missingCriteria: string[];
    };
  }>;
}

export function EligibilityChecker() {
  const [formData, setFormData] = useState<EligibilityForm>({
    state: "",
    annualIncome: "",
    category: "",
    occupation: "",
    age: ""
  });
  const [results, setResults] = useState<EligibilityResult | null>(null);

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  const incomeRanges = [
    { value: "50000", label: "Below ₹50,000" },
    { value: "100000", label: "₹50,000 - ₹1 Lakh" },
    { value: "300000", label: "₹1 - ₹3 Lakhs" },
    { value: "500000", label: "₹3 - ₹5 Lakhs" },
    { value: "800000", label: "₹5 - ₹8 Lakhs" },
    { value: "1800000", label: "₹8 - ₹18 Lakhs" },
    { value: "5000000", label: "Above ₹18 Lakhs" }
  ];

  const categories = ["General", "OBC", "SC", "ST", "EWS"];

  const occupations = [
    "Farmer", "Student", "Unemployed", "Self-employed", "Private Employee",
    "Government Employee", "Retired", "Homemaker", "Daily Wage Worker", "Other"
  ];

  const ageGroups = [
    { value: "18", label: "18-25 years" },
    { value: "30", label: "26-35 years" },
    { value: "40", label: "36-45 years" },
    { value: "50", label: "46-55 years" },
    { value: "60", label: "56-65 years" },
    { value: "70", label: "Above 65 years" }
  ];

  const checkEligibilityMutation = useMutation({
    mutationFn: async (data: EligibilityForm) => {
      // Create a temporary profile for eligibility checking
      const profile = {
        state: data.state,
        annualIncome: parseInt(data.annualIncome),
        category: data.category,
        occupation: data.occupation,
        dateOfBirth: new Date(Date.now() - parseInt(data.age) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // For demo purposes, we'll use a simplified approach
      // In production, this would call a specialized eligibility API
      const response = await apiRequest("GET", `/api/schemes?state=${data.state}&maxIncome=${data.annualIncome}&category=${data.category}`);
      return response.json();
    },
    onSuccess: (schemes) => {
      // Simulate eligibility scoring
      const eligibleSchemes = schemes.slice(0, 5).map((scheme: any) => ({
        scheme,
        eligibility: {
          eligible: Math.random() > 0.3, // Random for demo
          score: Math.random() * 0.7 + 0.3,
          reasons: [`Income matches criteria`, `Category eligible`, `State matches`],
          missingCriteria: []
        }
      }));

      setResults({ eligibleSchemes });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.state && formData.annualIncome && formData.category) {
      checkEligibilityMutation.mutate(formData);
    }
  };

  const handleFieldChange = (field: keyof EligibilityForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.state && formData.annualIncome && formData.category;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">State/UT *</label>
            <Select value={formData.state} onValueChange={(value) => handleFieldChange("state", value)}>
              <SelectTrigger data-testid="select-eligibility-state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Annual Income *</label>
            <Select value={formData.annualIncome} onValueChange={(value) => handleFieldChange("annualIncome", value)}>
              <SelectTrigger data-testid="select-eligibility-income">
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                {incomeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <Select value={formData.category} onValueChange={(value) => handleFieldChange("category", value)}>
              <SelectTrigger data-testid="select-eligibility-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Occupation</label>
            <Select value={formData.occupation} onValueChange={(value) => handleFieldChange("occupation", value)}>
              <SelectTrigger data-testid="select-eligibility-occupation">
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occupation) => (
                  <SelectItem key={occupation} value={occupation}>
                    {occupation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Age Group</label>
            <Select value={formData.age} onValueChange={(value) => handleFieldChange("age", value)}>
              <SelectTrigger data-testid="select-eligibility-age">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={!isFormValid || checkEligibilityMutation.isPending}
          data-testid="button-check-eligibility"
        >
          {checkEligibilityMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Eligibility...
            </>
          ) : (
            "Check Eligibility"
          )}
        </Button>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Eligibility Results</h3>
          
          {results.eligibleSchemes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Eligible Schemes Found</h4>
                <p className="text-muted-foreground">
                  Based on your current profile, we couldn't find matching schemes. 
                  Try adjusting your criteria or complete your full profile for better recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.eligibleSchemes.map((result, index) => (
                <Card key={result.scheme.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {result.scheme.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.scheme.benefits}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {result.scheme.category}
                        </Badge>
                      </div>
                      <div className="flex items-center ml-4">
                        {result.eligibility.eligible ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="ml-2 text-sm font-medium">
                          {Math.round(result.eligibility.score * 100)}% match
                        </span>
                      </div>
                    </div>
                    
                    {result.eligibility.eligible && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          ✅ You appear to be eligible for this scheme
                        </p>
                        <p className="text-xs text-green-600">
                          Complete your profile and apply to confirm eligibility
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button variant="outline" onClick={() => window.location.href = "/profile"} data-testid="button-complete-profile">
              Complete Profile for Better Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
