import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, ArrowRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { LOCATION_OPTIONS } from "@/lib/siteSettings";
import SearchableSelect from "@/components/ui/searchable-select";

export default function HeroSection() {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (location) params.set("location", location);
    if (jobType) params.set("type", jobType);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[94vh] flex items-center overflow-hidden bg-[#1a2332]">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#1e2a3a] to-[#162030]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[#4eca8b]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#4eca8b]/[0.03] rounded-full blur-[100px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 sm:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#4eca8b]/10 border border-[#4eca8b]/20 text-[#4eca8b] text-sm font-medium mb-8">
              <Building2 className="w-4 h-4" />
              {settings.hero_eyebrow || "Ireland's Leading Job Platform"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.1] text-white mb-7"
          >
            {settings.hero_title || "Find Your Dream Job"}{" "}
            <span className="text-[#4eca8b]">{settings.hero_highlight || "or Hire Top Talent"}</span>
            {" "}in Ireland
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#8899aa] leading-relaxed mb-14 max-w-2xl mx-auto"
          >
            {settings.hero_subtitle || "Connect with thousands of employers and job seekers across Ireland. Your next opportunity is just a search away."}
          </motion.p>

          {/* Search Bar — frosted glass */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-white/[0.07] backdrop-blur-md border border-white/[0.1] rounded-2xl p-2 shadow-[0_8px_40px_rgba(0,0,0,0.2)] max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-0">
              {/* Keyword */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-[1.1rem] h-[1.1rem] text-white/30" />
                <Input
                  placeholder="Job title or keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] text-white placeholder:text-white/30"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-7 bg-white/10" />
              </div>

              {/* Location */}
              <div className="flex-1">
                <SearchableSelect
                  options={[{ value: "", label: "All Locations" }, ...LOCATION_OPTIONS]}
                  value={location || ""}
                  onValueChange={(v) => setLocation(v)}
                  placeholder="Location"
                  searchPlaceholder="Search location..."
                  className="border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem] text-white/70"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-7 bg-white/10" />
              </div>

              {/* Job Type */}
              <div className="hidden sm:block">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 h-12 w-36 text-[0.95rem] text-white/40">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                className="bg-[#4eca8b] hover:bg-[#45b87e] text-white h-12 px-7 rounded-xl font-semibold text-[0.95rem] shrink-0"
              >
                <Search className="w-4 h-4 mr-2 sm:mr-0 lg:mr-2" />
                <span className="sm:hidden lg:inline">{settings.primary_cta || "Search"}</span>
              </Button>
            </div>
          </motion.form>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 font-medium rounded-full px-6 h-11 group"
              onClick={() => navigate("/auth")}
            >
              {settings.employer_cta || "Post a Job"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <span className="text-white/20">or</span>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 font-medium rounded-full px-6 h-11 group"
              onClick={() => navigate("/auth")}
            >
              Create Your Profile
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
}
