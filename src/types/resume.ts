export type ThemePreference = "light" | "dark" | "system";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: "github" | "linkedin" | "email" | "phone" | "website" | "x";
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  status: string;
  description: string;
  bullets: string[];
  links?: { label: string; url: string }[];
}

export interface SkillCategory {
  id: string;
  name: string;
  items: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  visible: boolean;
}

export type SectionId =
  | "hero"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications"
  | "services"
  | "contact";

export interface ResumeContent {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    photoUrl: string;
    tagline: string;
  };
  about: {
    heading: string;
    body: string;
  };
  experience: {
    heading: string;
    items: ExperienceItem[];
  };
  education: {
    heading: string;
    items: EducationItem[];
  };
  projects: {
    heading: string;
    items: ProjectItem[];
  };
  skills: {
    heading: string;
    categories: SkillCategory[];
  };
  certifications: {
    heading: string;
    items: CertificationItem[];
  };
  services: {
    heading: string;
    description: string;
    items: ServiceItem[];
  };
  contact: {
    heading: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
  socialLinks: SocialLink[];
  sections: SectionConfig[];
  seo: {
    title: string;
    description: string;
    ogImage: string;
    siteUrl: string;
    logoUrl: string;
    faviconUrl: string;
    googleSiteVerification: string;
  };
}

export const RESUME_CONTENT_KEY = "resume:content";
export const RESUME_PHOTO_KEY = "resume:photo";
export const RESUME_OG_KEY = "resume:media:og";
export const RESUME_LOGO_KEY = "resume:media:logo";
export const RESUME_FAVICON_KEY = "resume:media:favicon";
export const RESUME_CONTENT_VERSION = 1;
