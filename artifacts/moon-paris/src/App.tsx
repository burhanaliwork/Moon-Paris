import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/use-store";
import { useGetMe } from "@workspace/api-client-react";
import React from 'react';

// Pages
import NotFound from "@/pages/not-found";
import WelcomePage from "@/pages/welcome";
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import CartPage from "@/pages/cart";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminPromotions from "@/pages/admin/promotions";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading, isError } = useGetMe({ query: { retry: false } });
  const isGuest = useStore(state => state.isGuest);
  const [, setLoc] = useLocation();

  React.useEffect(() => {
    if (!isLoading && (isError || !user) && !isGuest) {
      setLoc('/welcome');
    }
  }, [isLoading, isError, user, isGuest]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  
  if ((isError || !user) && !isGuest) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome" component={WelcomePage} />
      
      {/* Protected/Store Routes */}
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/products" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/product/:id" component={() => <ProtectedRoute component={ProductPage} />} />
      <Route path="/cart" component={() => <ProtectedRoute component={CartPage} />} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/promotions" component={AdminPromotions} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
