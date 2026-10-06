// Enquiry delivery, kept deliberately broad until the client chooses a channel.
// The route builder produces a Brief; any EnquiryAdapter can deliver it. Today's adapters
// hand the brief to the visitor's own WhatsApp / email app (nothing leaves the browser until
// they press send there). A server-side adapter (Resend, Formspree, CRM…) can be added later
// by implementing the same interface; the UI does not change.
import { site, audiences, type AudienceId } from "@/content/site";
import { divisionBySlug } from "@/content/divisions";
import { goals, type GoalId } from "./suggest";

export type Brief = {
  audience?: AudienceId;
  goal?: GoalId;
  divisions: string[];
  name: string;
  business: string;
  email?: string;
  phone?: string;
  message?: string;
};

export type DeliveryResult = { ok: true; href?: string } | { ok: false; error: string };

export interface EnquiryAdapter {
  id: string;
  label: string;
  hint: string;
  deliver(brief: Brief): Promise<DeliveryResult>;
}

export function briefText(b: Brief): string {
  const aud = audiences.find((a) => a.id === b.audience)?.name;
  const goal = goals.find((g) => g.id === b.goal)?.label;
  const route = b.divisions.map((s) => divisionBySlug(s)?.shortName).filter(Boolean);
  return [
    `Hello ${site.name},`,
    "",
    `I'm ${b.name}${b.business ? ` from ${b.business}` : ""}.`,
    aud ? `We are: ${aud}.` : null,
    goal ? `Right now we want to: ${goal}.` : null,
    route.length ? `Our starting route: ${route.join(" → ")}.` : null,
    b.message ? `\n${b.message}` : null,
    "",
    [b.email && `Email: ${b.email}`, b.phone && `Phone: ${b.phone}`].filter(Boolean).join(" · "),
    "(Sent from the route planner on sxbp.com)",
  ].filter((l) => l !== null).join("\n");
}

export const whatsappAdapter: EnquiryAdapter = {
  id: "whatsapp",
  label: "Send on WhatsApp",
  hint: "Opens WhatsApp with your brief written. Nothing is sent until you press send.",
  async deliver(b) {
    const href = `https://wa.me/${site.phoneE164.replace("+", "")}?text=${encodeURIComponent(briefText(b))}`;
    return { ok: true, href };
  },
};

export const emailAdapter: EnquiryAdapter = {
  id: "email",
  label: "Send by email",
  hint: "Opens your email app with the brief filled in.",
  async deliver(b) {
    const subject = `New route — ${b.business || b.name}`;
    const href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText(b))}`;
    return { ok: true, href };
  },
};

export const copyAdapter: EnquiryAdapter = {
  id: "copy",
  label: "Copy the brief",
  hint: "Paste it anywhere you like.",
  async deliver(b) {
    try {
      await navigator.clipboard.writeText(briefText(b));
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't access the clipboard. Select the brief text instead." };
    }
  },
};

export const adapters: EnquiryAdapter[] = [whatsappAdapter, emailAdapter, copyAdapter];

export type BriefErrors = Partial<Record<"name" | "contact" | "email", string>>;

export function validate(b: Brief): BriefErrors {
  const errors: BriefErrors = {};
  if (!b.name.trim()) errors.name = "Tell us your name.";
  if (!b.email?.trim() && !b.phone?.trim()) errors.contact = "Add an email or a phone number so we can reply.";
  if (b.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) errors.email = "That email doesn't look right.";
  return errors;
}
