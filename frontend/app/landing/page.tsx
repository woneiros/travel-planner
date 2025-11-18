"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  const handleWaitlistClick = () => {
    setShowWaitlistForm(true);
    // Scroll to waitlist form
    setTimeout(() => {
      const formElement = document.getElementById("waitlist-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FDF8F1] via-[#F6F0E8] to-[#EDE7DF]">
      {/* Hero Section */}
      <HeroSection onWaitlistClick={handleWaitlistClick} />

      {/* Features Section */}
      <FeatureGrid />

      {/* Waitlist CTA Section */}
      <section
        id="waitlist-form"
        className="py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-[#121212] mb-4">
            Ready to plan your{" "}
            <span className="font-medium">next adventure?</span>
          </h2>
          <p className="text-lg md:text-xl text-[#4A4138] mb-10 md:mb-12 max-w-2xl mx-auto">
            Join our waitlist to be among the first to experience Treki
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

