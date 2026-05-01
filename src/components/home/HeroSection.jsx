import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/id/1031/2400/1600"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Overlay — gradient keeps left text readable, right side shows the image */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      {/* Decorative elements — desktop only */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute right-[6%] top-[12%] w-[22rem] h-[22rem] rounded-full border-[1.5px] border-accent/[0.08]"
      />
      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden lg:block absolute right-[16%] top-[32%] w-44 h-44 rounded-full bg-accent/[0.04]"
      />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="hidden lg:block absolute right-[9%] bottom-[18%] w-24 h-24 rounded-full bg-accent/[0.06]"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden lg:block absolute right-[22%] top-[18%] w-3 h-3 rounded-full bg-accent/20"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="hidden lg:block absolute right-[12%] bottom-[35%] w-2 h-2 rounded-full bg-accent/30"
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 sm:py-28">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 text-accent text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              {settings.hero_eyebrow || "Ireland's #1 Job Platform"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-display font-bold tracking-tight leading-[0.95] text-foreground mb-7"
          >
            {settings.hero_title || "Find work that"}{" "}
            <span className="text-accent">{settings.hero_highlight || "matters"}</span>
            <span className="text-accent">.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl"
          >
            {settings.hero_subtitle || "Connect with Ireland's top employers and discover opportunities that match your ambition."}
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-card border border-border rounded-2xl p-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-0">
              {/* Keyword */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-[1.1rem] h-[1.1rem] text-muted-foreground/50" />
                <Input
                  placeholder="Job title or keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-7 bg-border" />
              </div>

              {/* Location */}
              <div className="relative flex-1 flex items-center">
                <MapPin className="absolute left-4 w-[1.1rem] h-[1.1rem] text-muted-foreground/50 z-10" />
                <Input
                  placeholder="City or county"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:flex items-center">
                <div className="w-px h-7 bg-border" />
              </div>

              {/* Job Type */}
              <div className="hidden sm:block">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 h-12 w-40 text-[0.95rem] text-muted-foreground/70">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-7 rounded-xl font-semibold text-[0.95rem] shrink-0"
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
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8"
          >
            <Button
              variant="ghost"
              className="text-foreground font-medium group h-auto p-0 hover:bg-transparent"
              onClick={() => navigate("/employers")}
            >
              {settings.employer_cta || "Post a Job"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <span className="hidden sm:block text-border">|</span>
            <Button
              variant="ghost"
              className="text-foreground font-medium group h-auto p-0 hover:bg-transparent"
              onClick={() => navigate("/employees")}
            >
              Create Your Profile
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
