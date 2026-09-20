import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In | OUCE SIH 2026",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Bold Minimalism branding panel */}
      <div className="lg:w-1/2 bg-sih-blue flex flex-col justify-center items-start px-8 py-16 lg:px-16 relative overflow-hidden">
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.85] text-white tracking-[-0.04em] uppercase">
          JOIN <br />
          THE <br />
          <span className="text-sih-orange">MISSION</span>
        </h1>
        <p className="mt-8 text-white/80 font-body text-lg max-w-md leading-relaxed">
          Sign in with your Google account to register for the Osmania University 
          SIH 2026 Internal Hackathon.
        </p>

        {/* Decorative oversized text (Section 4 & 7 of design spec: Asymmetrical/Overlap) */}
        <div className="absolute bottom-[-5%] right-[-5%] text-[15vw] font-display text-white/10 select-none pointer-events-none tracking-tighter whitespace-nowrap hidden lg:block">
          SIH'26
        </div>
      </div>

      {/* Right: Clerk Sign-In form */}
      <div className="lg:w-1/2 flex items-center justify-center px-8 py-16 bg-white">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "shadow-none border-2 border-sih-gray rounded-none",
              headerTitle: "font-display text-2xl uppercase tracking-tight",
              headerSubtitle: "font-body text-sih-dark/70",
              socialButtonsBlockButton: "btn-primary rounded-none font-body font-bold uppercase tracking-wide",
              formButtonPrimary: "bg-sih-blue hover:bg-sih-darkBlue rounded-none font-body font-bold uppercase tracking-wide",
              footerActionLink: "text-sih-blue hover:text-sih-darkBlue font-body",
            },
          }}
          routing="path"
          path="/sign-in"
          fallbackRedirectUrl="/onboarding"
          signUpFallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}
