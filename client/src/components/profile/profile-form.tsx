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
import { useTranslation } from 'react-i18next';

// Form validation schema
const createProfileSchema = (t: any) => z.object({
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

export function ProfileForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const profileSchema = createProfileSchema(t);
  type ProfileFormData = z.infer<typeof profileSchema>;

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
  }) as { data: any, isLoading: boolean };

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: (profile as any).fullName || "",
        aadhaarNumber: (profile as any).aadhaarNumber || "",
        dateOfBirth: (profile as any).dateOfBirth || "",
        gender: (profile as any).gender || "",
        state: (profile as any).state || "",
        district: (profile as any).district || "",
        pincode: (profile as any).pincode || "",
        annualIncome: (profile as any).annualIncome || undefined,
        category: (profile as any).category || "",
        occupation: (profile as any).occupation || "",
        education: (profile as any).education || "",
        familySize: (profile as any).familySize || undefined,
        hasDisability: (profile as any).hasDisability || false,
        disabilityType: (profile as any).disabilityType || "",
        bankAccount: (profile as any).bankAccount || "",
        additionalDetails: (profile as any).additionalDetails || "",
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
              <Label htmlFor="fullName">{t("common.fullName")} *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder={t("common.enterYourFullName")}
                data-testid="input-full-name"
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="aadhaarNumber">{t("common.aadhaarNumber")}</Label>
              <Input
                id="aadhaarNumber"
                {...form.register("aadhaarNumber")}
                placeholder="XXXX XXXX XXXX"
                maxLength={12}
                data-testid="input-aadhaar"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">{t("common.dateOfBirth")}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth")}
                data-testid="input-date-of-birth"
              />
            </div>

            <div>
              <Label htmlFor="gender">{t("common.gender")}</Label>
              <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value)}>
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder={t("common.selectGender")} />
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
            {t("common.addressInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="state">{t("common.state")} *</Label>
              <Select value={form.watch("state")} onValueChange={(value) => form.setValue("state", value)}>
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder={t("common.selectYourState")} />
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
              <Label htmlFor="district">{t("common.district")}</Label>
              <Input
                id="district"
                {...form.register("district")}
                placeholder={t("common.enterYourDistrict")}
                data-testid="input-district"
              />
            </div>

            <div>
              <Label htmlFor="pincode">{t("common.pincode")}</Label>
              <Input
                id="pincode"
                {...form.register("pincode")}
                placeholder={t("common.enterPinCode")}
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
            {t("common.socioEconomicInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="annualIncome">{t("common.annualIncome")} (₹)</Label>
              <Input
                id="annualIncome"
                type="number"
                {...form.register("annualIncome", { valueAsNumber: true })}
                placeholder={t("common.enterAnnualIncome")}
                min="0"
                data-testid="input-annual-income"
              />
            </div>

            <div>
              <Label htmlFor="category">{t("common.category")}</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder={t("common.selectCategory")} />
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
              <Label htmlFor="occupation">{t("common.occupation")}</Label>
              <Select value={form.watch("occupation")} onValueChange={(value) => form.setValue("occupation", value)}>
                <SelectTrigger data-testid="select-occupation">
                  <SelectValue placeholder={t("common.selectOccupation")} />
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
              <Label htmlFor="education">{t("common.educationLevel")}</Label>
              <Select value={form.watch("education")} onValueChange={(value) => form.setValue("education", value)}>
                <SelectTrigger data-testid="select-education">
                  <SelectValue placeholder={t("common.selectEducationLevel")} />
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
            {t("common.familyAndAdditionalInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="familySize">{t("common.familySize")}</Label>
              <Input
                id="familySize"
                type="number"
                {...form.register("familySize", { valueAsNumber: true })}
                placeholder={t("common.numberOfFamilyMembers")}
                min="1"
                data-testid="input-family-size"
              />
            </div>

            <div>
              <Label htmlFor="bankAccount">{t("common.bankAccountNumber")}</Label>
              <Input
                id="bankAccount"
                {...form.register("bankAccount")}
                placeholder={t("common.bankAccountForDBT")}
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
              <Label htmlFor="hasDisability">{t("common.iHaveADisability")}</Label>
            </div>

            {form.watch("hasDisability") && (
              <div>
                <Label htmlFor="disabilityType">{t("common.typeOfDisability")}</Label>
                <Input
                  id="disabilityType"
                  {...form.register("disabilityType")}
                  placeholder={t("common.specifyTypeOfDisability")}
                  data-testid="input-disability-type"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="additionalDetails">{t("common.additionalDetails")}</Label>
            <Textarea
              id="additionalDetails"
              {...form.register("additionalDetails")}
              placeholder={t("common.additionalInfoForSchemeRecommendations")}
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
              {t("common.profileCompleteness")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.watch("fullName") && <Badge variant="secondary">{t("common.fullName")} ✓</Badge>}
              {form.watch("state") && <Badge variant="secondary">{t("common.state")} ✓</Badge>}
              {form.watch("annualIncome") && <Badge variant="secondary">{t("common.annualIncome")} ✓</Badge>}
              {form.watch("category") && <Badge variant="secondary">{t("common.category")} ✓</Badge>}
              {form.watch("occupation") && <Badge variant="secondary">{t("common.occupation")} ✓</Badge>}
              {form.watch("education") && <Badge variant="secondary">{t("common.educationLevel")} ✓</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("common.completeMoreFields")}
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
              {t("common.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {profile ? t("common.updateProfile") : t("common.saveProfile")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
