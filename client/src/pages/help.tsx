import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, Phone, Mail, Clock, MessageCircle, 
  Book, Video, FileText, ExternalLink, Search 
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const faqs = [
    {
      id: "1",
      category: "General",
      question: "What is SarkarConnect?",
      answer: "SarkarConnect is an AI-powered citizen portal that helps you discover and apply for government schemes based on your socio-economic profile. It provides personalized recommendations and real-time application tracking."
    },
    {
      id: "2", 
      category: "Schemes",
      question: "How do I check my eligibility for a scheme?",
      answer: "You can check eligibility in multiple ways: 1) Use the Quick Eligibility Checker on the homepage, 2) View the 'Check Eligibility' button on any scheme card, 3) Complete your profile for AI-powered recommendations."
    },
    {
      id: "3",
      category: "Applications",
      question: "How can I track my application status?",
      answer: "You can track your applications by: 1) Visiting the 'My Applications' page, 2) Using the Application Tracker with your Application ID or Aadhaar number, 3) Enabling notifications for real-time updates."
    },
    {
      id: "4",
      category: "Profile",
      question: "Why should I complete my profile?",
      answer: "Completing your profile helps our AI engine provide better scheme recommendations. The more information you provide about your income, occupation, location, and other details, the more accurate our suggestions will be."
    },
    {
      id: "5",
      category: "Chatbot",
      question: "What languages does the chatbot support?",
      answer: "Our AI chatbot supports 12+ Indian languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, and Assamese."
    },
    {
      id: "6",
      category: "Security",
      question: "Is my personal information secure?",
      answer: "Yes, we follow government-grade security protocols. Your data is encrypted and stored securely. We only use your information to provide scheme recommendations and never share it with unauthorized parties."
    }
  ];

  const resources = [
    {
      title: "User Guide",
      description: "Complete guide on how to use SarkarConnect",
      icon: Book,
      type: "PDF",
      link: "#"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video tutorials",
      icon: Video,
      type: "Video",
      link: "#"
    },
    {
      title: "Scheme Guidelines",
      description: "Official government scheme guidelines",
      icon: FileText,
      type: "Document",
      link: "#"
    },
    {
      title: "API Documentation",
      description: "For developers and integrators",
      icon: FileText,
      type: "Documentation",
      link: "#"
    }
  ];

  const contactChannels = [
    {
      title: "24/7 Helpline",
      subtitle: "1800-XXX-XXXX",
      description: "Free calling from any phone",
      icon: Phone,
      action: "Call Now"
    },
    {
      title: "Email Support",
      subtitle: "support@sarkarconnect.gov.in",
      description: "Response within 24 hours",
      icon: Mail,
      action: "Send Email"
    },
    {
      title: "Live Chat",
      subtitle: "Available 9 AM - 6 PM",
      description: "Instant support via chat",
      icon: MessageCircle,
      action: "Start Chat"
    },
    {
      title: "Office Hours",
      subtitle: "Mon-Fri: 9:00 AM - 5:30 PM",
      description: "Government office timings",
      icon: Clock,
      action: "View Details"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <HelpCircle className="h-8 w-8 text-primary mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with using SarkarConnect and understanding government schemes
          </p>
        </div>
      </div>

      {/* Contact Channels */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactChannels.map((channel, index) => (
              <div key={index} className="text-center p-4 rounded-lg border border-border">
                <channel.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{channel.title}</h3>
                <p className="text-primary font-medium mb-1">{channel.subtitle}</p>
                <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                <Button variant="outline" size="sm" data-testid={`button-${channel.action.toLowerCase().replace(' ', '-')}`}>
                  {channel.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Grievance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Having issues with a scheme application? File a grievance for faster resolution.
            </p>
            <div className="space-y-4">
              <Select>
                <SelectTrigger data-testid="select-grievance-category">
                  <SelectValue placeholder="Select grievance category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application-delay">Application Delay</SelectItem>
                  <SelectItem value="document-issue">Document Issue</SelectItem>
                  <SelectItem value="payment-delay">Payment Delay</SelectItem>
                  <SelectItem value="technical-issue">Technical Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="Describe your issue..." 
                data-testid="textarea-grievance-description"
              />
              <Button className="w-full" data-testid="button-submit-grievance">
                Submit Grievance
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Callback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Schedule a call with our support team for personalized assistance.
            </p>
            <div className="space-y-4">
              <Input 
                placeholder="Your phone number" 
                data-testid="input-callback-phone"
              />
              <Select>
                <SelectTrigger data-testid="select-callback-time">
                  <SelectValue placeholder="Preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                  <SelectItem value="evening">Evening (4 PM - 6 PM)</SelectItem>
                </SelectContent>
              </Select>
              <Textarea 
                placeholder="What do you need help with?" 
                data-testid="textarea-callback-topic"
              />
              <Button className="w-full" data-testid="button-request-callback">
                Request Callback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* FAQ Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-faqs"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-faq-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* FAQ Accordion */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No FAQs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <resource.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                  <Button variant="ghost" size="sm" data-testid={`button-resource-${index}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Government Links Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Official Government Portals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="https://www.myscheme.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              data-testid="link-myscheme"
            >
              <span className="font-medium">myScheme Portal</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="https://apisetu.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              data-testid="link-apisetu"
            >
              <span className="font-medium">API Setu</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="https://www.data.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              data-testid="link-data-gov"
            >
              <span className="font-medium">Open Government Data</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="https://www.digitalindia.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              data-testid="link-digital-india"
            >
              <span className="font-medium">Digital India</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
