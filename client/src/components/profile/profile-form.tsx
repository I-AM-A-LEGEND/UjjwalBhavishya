import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Save, User, MapPin, Briefcase, GraduationCap, Home, Heart } from "lucide-react";

// Form validation schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  aadhaarNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  state: z.string().min(1, "State is required"),
  district: z.string().optional(),
  pincode: z.string().optional(),
  annualIncome: z.number().min(0, "Income must be positive").optional(),
  category: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  familySize: z.number().min(1, "Family size must be at least 1").optional(),
  hasDisability: z.boolean().optional(),
  disabilityType: z.string().optional(),
  bankAccount: z.string().optional(),
  additionalDetails: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [userId] = useState("user1"); // TODO: Get from auth context
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      aadhaarNumber: "",
      dateOfBirth: "",
      gender: "",
      state: "",
      district: "",
      pincode: "",
      annualIncome: undefined,
      category: "",
      occupation: "",
      education: "",
      familySize: undefined,
      hasDisability: false,
      disabilityType: "",
      bankAccount: "",
      additionalDetails: "",
    },
  });

  // Fetch existing profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile", userId],
    enabled: !!userId,
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        aadhaarNumber: profile.aadhaarNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        state: profile.state || "",
        district: profile.district || "",
        pincode: profile.pincode || "",
        annualIncome: profile.annualIncome || undefined,
        category: profile.category || "",
        occupation: profile.occupation || "",
        education: profile.education || "",
        familySize: profile.familySize || undefined,
        hasDisability: profile.hasDisability || false,
        disabilityType: profile.disabilityType || "",
        bankAccount: profile.bankAccount || "",
        additionalDetails: profile.additionalDetails || "",
      });
    }
  }, [profile, form]);

  // Create/Update profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const payload = {
        userId,
        ...data,
        additionalDetails: data.additionalDetails ? { notes: data.additionalDetails } : null,
      };

      if (profile) {
        const response = await apiRequest("PUT", `/api/profile/${userId}`, payload);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/profile", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully. New scheme recommendations will be generated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations", userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  const categories = ["General", "OBC", "SC", "ST", "EWS"];
  const genders = ["Male", "Female", "Other"];
  const educationLevels = [
    "No formal education", "Primary", "Secondary", "Higher Secondary",
    "Graduate", "Post Graduate", "Doctorate", "Diploma", "ITI", "Other"
  ];
  const occupations = [
    "Farmer", "Student", "Unemployed", "Self-employed", "Private Employee",
    "Government Employee", "Retired", "Homemaker", "Daily Wage Worker",
    "Business Owner", "Professional", "Other"
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder="Enter your full name"
                data-testid="input-full-name"
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
              <Input
                id="aadhaarNumber"
                {...form.register("aadhaarNumber")}
                placeholder="XXXX XXXX XXXX"
                maxLength={12}
                data-testid="input-aadhaar"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth")}
                data-testid="input-date-of-birth"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value)}>
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="state">State/UT *</Label>
              <Select value={form.watch("state")} onValueChange={(value) => form.setValue("state", value)}>
                <SelectTrigger data-testid="select-state">
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
              {form.formState.errors.state && (
                <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                {...form.register("district")}
                placeholder="Enter your district"
                data-testid="input-district"
              />
            </div>

            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                {...form.register("pincode")}
                placeholder="Enter PIN code"
                maxLength={6}
                data-testid="input-pincode"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Socio-Economic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Socio-Economic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="annualIncome">Annual Income (₹)</Label>
              <Input
                id="annualIncome"
                type="number"
                {...form.register("annualIncome", { valueAsNumber: true })}
                placeholder="Enter annual income"
                min="0"
                data-testid="input-annual-income"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger data-testid="select-category">
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
              <Label htmlFor="occupation">Occupation</Label>
              <Select value={form.watch("occupation")} onValueChange={(value) => form.setValue("occupation", value)}>
                <SelectTrigger data-testid="select-occupation">
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

            <div>
              <Label htmlFor="education">Education Level</Label>
              <Select value={form.watch("education")} onValueChange={(value) => form.setValue("education", value)}>
                <SelectTrigger data-testid="select-education">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family & Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Family & Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="familySize">Family Size</Label>
              <Input
                id="familySize"
                type="number"
                {...form.register("familySize", { valueAsNumber: true })}
                placeholder="Number of family members"
                min="1"
                data-testid="input-family-size"
              />
            </div>

            <div>
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                {...form.register("bankAccount")}
                placeholder="Bank account for DBT"
                data-testid="input-bank-account"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDisability"
                checked={form.watch("hasDisability")}
                onCheckedChange={(checked) => form.setValue("hasDisability", !!checked)}
                data-testid="checkbox-has-disability"
              />
              <Label htmlFor="hasDisability">I have a disability</Label>
            </div>

            {form.watch("hasDisability") && (
              <div>
                <Label htmlFor="disabilityType">Type of Disability</Label>
                <Input
                  id="disabilityType"
                  {...form.register("disabilityType")}
                  placeholder="Specify type of disability"
                  data-testid="input-disability-type"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="additionalDetails">Additional Details</Label>
            <Textarea
              id="additionalDetails"
              {...form.register("additionalDetails")}
              placeholder="Any additional information that might help with scheme recommendations..."
              rows={3}
              data-testid="textarea-additional-details"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Status */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.watch("fullName") && <Badge variant="secondary">Name ✓</Badge>}
              {form.watch("state") && <Badge variant="secondary">Location ✓</Badge>}
              {form.watch("annualIncome") && <Badge variant="secondary">Income ✓</Badge>}
              {form.watch("category") && <Badge variant="secondary">Category ✓</Badge>}
              {form.watch("occupation") && <Badge variant="secondary">Occupation ✓</Badge>}
              {form.watch("education") && <Badge variant="secondary">Education ✓</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              Complete more fields to get better AI-powered scheme recommendations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={profileMutation.isPending}
          data-testid="button-save-profile"
        >
          {profileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {profile ? "Update Profile" : "Save Profile"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
