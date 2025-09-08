import { storage } from "../storage";
import { InsertScheme } from "@shared/schema";

const mockSchemes: InsertScheme[] = [
  {
    name: "Pradhan Mantri Jan Dhan Yojana",
    description: "National Mission for Financial Inclusion to ensure access to financial services, namely, Banking/ Savings & Deposit Accounts, Remittance, Credit, Insurance, Pension in an affordable manner.",
    category: "Financial Inclusion",
    ministry: "Ministry of Finance",
    state: null,
    eligibilityCriteria: { minAge: 10, documents: ["Aadhaar Card", "PAN Card"] },
    benefits: "Access to banking services, RuPay Debit Card, Accident Insurance Cover of Rs. 1 lakh, Life Cover of Rs. 30,000.",
    applicationProcess: "Open an account at any bank branch or Business Correspondent (Bank Mitra) outlet.",
    documents: ["Aadhaar Card", "PAN Card"],
    applicationUrl: "https://www.pmjdy.gov.in/",
    maxIncome: null,
    minAge: 10,
    maxAge: null,
    targetCategories: null,
    targetOccupations: null,
  },
  {
    name: "Pradhan Mantri Awas Yojana (Urban)",
    description: "Affordable housing for all by 2022. Provides central assistance to urban local bodies and other implementing agencies through States/UTs for providing houses to all eligible families/beneficiaries.",
    category: "Housing",
    ministry: "Ministry of Housing and Urban Affairs",
    state: null,
    eligibilityCriteria: { incomeGroup: "EWS/LIG/MIG", noPuccaHouse: true },
    benefits: "Interest subsidy on home loans, affordable housing in partnership, beneficiary-led construction/enhancement.",
    applicationProcess: "Apply online through PMAY(U) website or common service centers.",
    documents: ["Aadhaar Card", "Income Certificate", "Property documents"],
    applicationUrl: "https://pmaymis.gov.in/",
    maxIncome: 1800000, // For MIG
    minAge: 18,
    maxAge: null,
    targetCategories: null,
    targetOccupations: null,
  },
  {
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    description: "World's largest health insurance/ assurance scheme fully financed by the government. It provides a cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.",
    category: "Healthcare",
    ministry: "Ministry of Health and Family Welfare",
    state: null,
    eligibilityCriteria: { socioEconomicStatus: "SECC 2011 criteria" },
    benefits: "Cashless access to health care services, covers over 1,393 procedures, pre and post-hospitalisation expenses.",
    applicationProcess: "Beneficiaries identified based on SECC 2011 data. No enrollment required.",
    documents: ["Aadhaar Card"],
    applicationUrl: "https://pmjay.gov.in/",
    maxIncome: null,
    minAge: null,
    maxAge: null,
    targetCategories: ["SC", "ST", "OBC"],
    targetOccupations: ["Manual Scavengers", "Rag Pickers", "Domestic Workers"],
  },
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "An income support scheme for farmers. Provides financial benefit of Rs 6,000 per year in three equal installments of Rs 2,000 every four months.",
    category: "Agriculture",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    state: null,
    eligibilityCriteria: { landholdingFarmers: true },
    benefits: "Direct income support to farmer families.",
    applicationProcess: "Farmers can register through Common Service Centres, State Nodal Officers, or self-register through the PM-KISAN portal.",
    documents: ["Aadhaar Card", "Landholding documents", "Bank Account details"],
    applicationUrl: "https://pmkisan.gov.in/",
    maxIncome: null,
    minAge: 18,
    maxAge: null,
    targetCategories: null,
    targetOccupations: ["Farmer"],
  },
  {
    name: "National Scholarship Portal (NSP)",
    description: "A one-stop solution through which various services starting from student application, application receipt, processing, sanction and disbursal of various scholarships to Students are enabled.",
    category: "Education",
    ministry: "Ministry of Electronics and Information Technology",
    state: null,
    eligibilityCriteria: { academicMerit: true, incomeCriteria: true },
    benefits: "Financial assistance for education.",
    applicationProcess: "Apply online through the National Scholarship Portal.",
    documents: ["Aadhaar Card", "Income Certificate", "Academic Certificates"],
    applicationUrl: "https://scholarships.gov.in/",
    maxIncome: 250000,
    minAge: null,
    maxAge: null,
    targetCategories: null,
    targetOccupations: null,
  },
];

async function seedSchemes() {
  console.log("Seeding mock schemes...");
  try {
    for (const scheme of mockSchemes) {
      await storage.createScheme(scheme);
      console.log(`Inserted scheme: ${scheme.name}`);
    }
    console.log("Mock schemes seeded successfully.");
  } catch (error) {
    console.error("Error seeding mock schemes:", error);
  }
  process.exit(0);
}

seedSchemes();
