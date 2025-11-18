"use client";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "📹",
    title: "Extract from Videos",
    description:
      "Paste any YouTube travel video URL and instantly extract all recommended places, restaurants, and attractions",
  },
  {
    icon: "💬",
    title: "Chat about the Extracted Places",
    description:
      "Brainstorm and refine your trip ideas with our AI assistant powered by your extracted places",
  },
  {
    icon: "📋",
    title: "Build and Perfect your Personalized Itinerary",
    description:
      "Create a custom itinerary tailored to your interests, with all your favorite places organized",
  },
  {
    icon: "🗺️",
    title: "Export to Google Maps",
    description:
      "One-click export to Google Maps to take your itinerary on the go",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-[#121212] mb-4">
            Everything you need to plan your{" "}
            <span className="font-medium">perfect trip</span>
          </h2>
          <p className="text-lg md:text-xl text-[#4A4138] max-w-2xl mx-auto">
            From video extraction to itinerary creation, Treki has you covered
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-2xl border border-[#E0D8CC] bg-gradient-to-br from-[#FDF8F1] to-white hover:border-[#9AF18A] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 md:gap-6">
                {/* Icon */}
                <div className="text-4xl md:text-5xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-display font-medium text-[#121212] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base md:text-lg text-[#4A4138] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

