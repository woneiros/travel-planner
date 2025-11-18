"use client";

import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  onWaitlistClick?: () => void;
}

export default function HeroSection({ onWaitlistClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 md:px-6 lg:px-8 py-20 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <Image
            src="/Treki_Logo_Transparent.svg"
            alt="Treki Logo"
            width={240}
            height={108}
            priority
            unoptimized
            className="h-24 w-auto md:h-32 lg:h-40"
          />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-light text-[#121212] mb-6 md:mb-8 leading-tight">
          Plan Your Perfect Trip from{" "}
          <span className="font-medium">YouTube Videos</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-[#4A4138] mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Extract travel recommendations, brainstorm with AI, and build your
          personalized itinerary—all in one place
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onWaitlistClick}
            className="px-8 py-4 md:px-10 md:py-5 bg-[#4AA83D] text-white text-lg md:text-xl font-medium rounded-xl hover:bg-[#3A8430] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Join the Waitlist
          </button>
          <Link
            href="/sign-in"
            className="px-8 py-4 md:px-10 md:py-5 bg-white text-[#4AA83D] text-lg md:text-xl font-medium rounded-xl border-2 border-[#4AA83D] hover:bg-[#F0FCF0] transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

