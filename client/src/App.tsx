import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Chatbot } from "@/components/chatbot/chatbot";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Schemes from "@/pages/schemes";
import Help from "@/pages/help";
import NotFound from "@/pages/not-found";
import "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/schemes" component={Schemes} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
            <Chatbot />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
