import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationTracker } from "@/components/applications/application-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Bell } from "lucide-react";
import { useState } from "react";

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState("");

  // TODO: Use actual user ID from authentication
  const userId = "user1";

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/applications", userId],
  });

  const filteredApplications = applications.filter((app: any) =>
    app.scheme?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "disbursed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <FileText className="h-8 w-8 text-primary mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your scheme applications
          </p>
        </div>
      </div>

      {/* Application Tracker Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Track Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationTracker />
        </CardContent>
      </Card>

      {/* Search Applications */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search by scheme name or application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="input-search-applications"
            />
            <Button variant="outline" data-testid="button-enable-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Application History ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "No matching applications found" : "No applications yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Start by exploring and applying to schemes that match your profile"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => window.location.href = "/schemes"}>
                  Browse Schemes
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application: any) => (
                <Card key={application.id} className="border border-border" data-testid={`application-${application.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {application.scheme?.name || "Unknown Scheme"}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          Application ID: {application.applicationId || application.id}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {formatStatus(application.status)}
                      </Badge>
                    </div>

                    {application.scheme && (
                      <div className="bg-muted/30 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">Scheme Details</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {application.scheme.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{application.scheme.category}</Badge>
                          <Badge variant="outline">{application.scheme.ministry}</Badge>
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    {application.statusHistory && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Application Timeline</h4>
                        <div className="space-y-2">
                          {(application.statusHistory as any[]).map((history: any, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <div className={`w-3 h-3 rounded-full mr-3 ${
                                index === 0 ? 'bg-primary' : 'bg-muted'
                              }`}></div>
                              <span className="flex-1">
                                {formatStatus(history.status)} - {new Date(history.timestamp).toLocaleDateString()}
                              </span>
                              {history.remarks && (
                                <span className="text-muted-foreground ml-2">
                                  {history.remarks}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.remarks && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Remarks:</p>
                        <p className="text-sm text-yellow-700">{application.remarks}</p>
                      </div>
                    )}

                    {application.amount && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Benefit Amount: ₹{application.amount}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
