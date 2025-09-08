import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SchemeCard } from "@/components/schemes/scheme-card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Bookmark } from "lucide-react";

interface SchemeFilters {
  search: string;
  category: string;
  state: string;
  maxIncome: string;
}

export default function Schemes() {
  const [filters, setFilters] = useState<SchemeFilters>({
    search: "",
    category: "",
    state: "",
    maxIncome: ""
  });

  const { data: schemes = [], isLoading: schemesLoading } = useQuery({
    queryKey: ["/api/schemes", filters],
    queryFn: ({ queryKey }) => {
      const [, params] = queryKey as [string, SchemeFilters];
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append("search", params.search);
      if (params.category) searchParams.append("category", params.category);
      if (params.state) searchParams.append("state", params.state);
      if (params.maxIncome) searchParams.append("maxIncome", params.maxIncome);
      
      return fetch(`/api/schemes?${searchParams.toString()}`).then(res => res.json());
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/schemes/categories"],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/recommendations/user1"], // TODO: Use actual user ID
    enabled: false // Enable when user is authenticated
  });

  const handleFilterChange = (key: keyof SchemeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", state: "", maxIncome: "" });
  };

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Search className="h-8 w-8 text-primary mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Government Schemes</h1>
          <p className="text-muted-foreground">
            Discover schemes that match your profile and eligibility criteria
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Schemes</label>
              <Input
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                data-testid="input-search-schemes"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">State/UT</label>
              <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                <SelectTrigger data-testid="select-state">
                  <SelectValue placeholder="All India" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All India</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Max Income</label>
              <Select value={filters.maxIncome} onValueChange={(value) => handleFilterChange("maxIncome", value)}>
                <SelectTrigger data-testid="select-income">
                  <SelectValue placeholder="Any income" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any income</SelectItem>
                  <SelectItem value="100000">Below ₹1 Lakh</SelectItem>
                  <SelectItem value="300000">Below ₹3 Lakhs</SelectItem>
                  <SelectItem value="500000">Below ₹5 Lakhs</SelectItem>
                  <SelectItem value="800000">Below ₹8 Lakhs</SelectItem>
                  <SelectItem value="1800000">Below ₹18 Lakhs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value) {
                  return (
                    <Badge key={key} variant="secondary" className="cursor-pointer">
                      {key}: {value}
                    </Badge>
                  );
                }
                return null;
              })}
            </div>
            <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Schemes Section */}
      {recommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-primary" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((rec: any) => (
                <SchemeCard 
                  key={rec.scheme.id} 
                  scheme={rec.scheme}
                  recommendation={rec}
                  showEligibilityButton={true}
                  data-testid={`recommended-scheme-${rec.scheme.id}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Schemes Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Schemes ({schemes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schemesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-2 bg-muted rounded mb-2"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No schemes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme: any) => (
                <SchemeCard 
                  key={scheme.id} 
                  scheme={scheme}
                  showEligibilityButton={true}
                  data-testid={`scheme-card-${scheme.id}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
