import { Navigate } from "react-router";
import { useAuth } from "@clerk/react";
import CTASection from "../components/home/CTASection";
import FeaturesSection from "../components/home/FeaturesSection";
import HeroSection from "../components/home/HeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import StatsSection from "../components/home/StatsSection";
import TestimonialsSection from "../components/home/TestimonialsSection";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
