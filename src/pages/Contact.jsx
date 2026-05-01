import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import contactService from "@/services/contact";
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const contactDetails = [
  { icon: Mail, label: "Email", key: "contact_email", fallback: "info@jobsdirect.ie" },
  { icon: Phone, label: "Phone", key: "contact_phone", fallback: "+353 1 234 5678" },
  { icon: MapPin, label: "Address", key: "office_location", fallback: "Dublin, Ireland" },
];

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await contactService.create(form);
    setSending(false);
    setSent(true);
    toast.success("Message Sent — We'll get back to you soon.");
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative bg-muted/40 border-b border-border/50 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4 block">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-3">
              Contact Us
            </h1>
            <p className="text-muted-foreground text-lg">
              Have a question or need help? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info — sidebar */}
          <div className="lg:col-span-4 space-y-3">
            {contactDetails.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="flex items-center gap-4 p-5 rounded-xl bg-muted/50 border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {settings[item.key] || item.fallback}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Extra info */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <CardContent className="p-6 sm:p-8">
                {sent ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-accent/[0.08] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-2">Message sent</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      Thanks for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full px-6 h-10 font-medium"
                      onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                    >
                      Send Another Message
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your full name"
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="+353..."
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                        <Input
                          id="subject"
                          value={form.subject}
                          onChange={(e) => update("subject", e.target.value)}
                          placeholder="What's this about?"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Tell us how we can help..."
                        required
                        className="min-h-[160px] resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-8 h-12"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  );
}
