import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

interface ApplicationStatus {
  id: string;
  applicationId: string;
  schemeName: string;
  status: string;
  appliedDate: string;
  lastUpdated: string;
  timeline: Array<{
    status: string;
    date: string;
    description: string;
    isCompleted: boolean;
  }>;
}

export function ApplicationTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<ApplicationStatus | null>(null);
  const { lastMessage, isConnected } = useWebSocket("ws://localhost:3000/ws");

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === "application_status_updated" && trackedApplication && data.data.id === trackedApplication.id) {
        setTrackedApplication(prev => {
          if (!prev) return null;
          const newStatus = data.data.status;
          const newTimeline = [...prev.timeline];
          const lastStep = newTimeline[newTimeline.length - 1];
          if (lastStep.status.toLowerCase() !== newStatus.toLowerCase()) {
            lastStep.isCompleted = true;
            newTimeline.push({
              status: newStatus,
              date: new Date().toLocaleDateString(),
              description: `Status updated to ${newStatus}`,
              isCompleted: false,
            });
          }

          return {
            ...prev,
            status: newStatus,
            lastUpdated: new Date().toLocaleDateString(),
            timeline: newTimeline,
          };
        });
      }
    }
  }, [lastMessage, trackedApplication]);

  // Mock application tracking - in production this would call actual government APIs
  const trackApplicationMutation = useMutation({
    mutationFn: async (query: string) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock application data
      if (query.toLowerCase().includes("pk") || query.includes("1234")) {
        return {
          id: "app-123",
          applicationId: "PKS2024001234",
          schemeName: "PM Kisan Samman Nidhi",
          status: "Under Review",
          appliedDate: "2024-01-15",
          lastUpdated: "2024-01-20",
          timeline: [
            {
              status: "Application Submitted",
              date: "2024-01-15",
              description: "Your application has been successfully submitted",
              isCompleted: true
            },
            {
              status: "Document Verification",
              date: "2024-01-18",
              description: "Documents are being verified by the concerned department",
              isCompleted: true
            },
            {
              status: "Under Review",
              date: "2024-01-20",
              description: "Application is under review by the approval committee",
              isCompleted: true
            },
            {
              status: "Approval & Disbursement",
              date: "Pending",
              description: "Pending approval and benefit disbursement",
              isCompleted: false
            }
          ]
        };
      } else if (query.toLowerCase().includes("ab") || query.includes("5678")) {
        return {
          id: "app-456",
          applicationId: "ABPY2024005678",
          schemeName: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
          status: "Approved",
          appliedDate: "2023-12-10",
          lastUpdated: "2024-01-05",
          timeline: [
            {
              status: "Application Submitted",
              date: "2023-12-10",
              description: "Your application has been successfully submitted",
              isCompleted: true
            },
            {
              status: "Document Verification",
              date: "2023-12-15",
              description: "Documents verified successfully",
              isCompleted: true
            },
            {
              status: "Medical Assessment",
              date: "2023-12-20",
              description: "Medical assessment completed",
              isCompleted: true
            },
            {
              status: "Approved",
              date: "2024-01-05",
              description: "Application approved. Card will be issued soon.",
              isCompleted: true
            }
          ]
        };
      }
      
      throw new Error("Application not found");
    },
    onSuccess: (data) => {
      setTrackedApplication(data);
    },
    onError: () => {
      setTrackedApplication(null);
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackApplicationMutation.mutate(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "under review":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "under review":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Enter Application ID or Aadhaar Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          data-testid="input-application-search"
        />
        <Button 
          onClick={handleSearch}
          disabled={!searchQuery.trim() || trackApplicationMutation.isPending}
          data-testid="button-track-application"
        >
          {trackApplicationMutation.isPending ? (
            <>
              <Search className="mr-2 h-4 w-4 animate-spin" />
              Tracking...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Track Status
            </>
          )}
        </Button>
      </div>

      {/* Demo Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Demo Instructions</h4>
          <p className="text-sm text-blue-700 mb-2">
            Try these sample Application IDs to see the tracking in action:
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => setSearchQuery("PKS2024001234")}
            >
              PKS2024001234
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => setSearchQuery("ABPY2024005678")}
            >
              ABPY2024005678
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {trackApplicationMutation.isError && (
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Application Not Found</h3>
            <p className="text-red-700 text-sm">
              We couldn't find an application with the provided ID. Please check your input and try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Status Display */}
      {trackedApplication && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="tracked-scheme-name">
                  {trackedApplication.schemeName}
                </h3>
                <p className="text-muted-foreground text-sm mb-1">
                  Application ID: {trackedApplication.applicationId}
                </p>
                <p className="text-muted-foreground text-sm">
                  Applied on: {new Date(trackedApplication.appliedDate).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground text-sm">
                  Last updated: {new Date(trackedApplication.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(trackedApplication.status)}
                <Badge className={`ml-2 ${getStatusColor(trackedApplication.status)}`} data-testid="tracked-status">
                  {trackedApplication.status}
                </Badge>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Application Timeline</h4>
              <div className="space-y-4">
                {trackedApplication.timeline.map((step, index) => (
                  <div key={index} className="flex items-start" data-testid={`timeline-step-${index}`}>
                    <div className={`w-4 h-4 rounded-full mr-4 mt-1 flex-shrink-0 ${
                      step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className={`font-medium ${
                          step.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.status}
                        </h5>
                        <span className="text-sm text-muted-foreground">
                          {step.date}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        step.isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
              {trackedApplication.status === "Under Review" && (
                <p className="text-sm text-blue-700">
                  Your application is currently being reviewed. You will receive an SMS/email notification once there's an update. 
                  Expected processing time: 7-10 working days.
                </p>
              )}
              {trackedApplication.status === "Approved" && (
                <p className="text-sm text-blue-700">
                  Congratulations! Your application has been approved. You will receive your benefits/card soon.
                  Keep this Application ID for future reference.
                </p>
              )}
            </div>

            {/* Notification Settings */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Want real-time updates?
              </span>
              <Button variant="outline" size="sm" data-testid="button-enable-notifications-tracker">
                Enable Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
