"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#F6F0E8] border-t border-[#E0D8CC] py-12 md:py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/Treki_Logo_Transparent.svg"
              alt="Treki Logo"
              width={160}
              height={72}
              className="h-16 w-auto"
            />
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="#features"
              className="text-[#4A4138] hover:text-[#4AA83D] transition-colors text-sm md:text-base"
            >
              Features
            </Link>
            <Link
              href="/sign-in"
              className="text-[#4A4138] hover:text-[#4AA83D] transition-colors text-sm md:text-base"
            >
              Sign In
            </Link>
            <Link
              href="#"
              className="text-[#4A4138] hover:text-[#4AA83D] transition-colors text-sm md:text-base"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-[#4A4138] hover:text-[#4AA83D] transition-colors text-sm md:text-base"
            >
              Terms
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-[#E0D8CC] text-center">
          <p className="text-sm text-[#6C6256]">
            © {new Date().getFullYear()} Treki. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

