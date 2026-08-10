"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  Upload,
  LogOut,
} from "lucide-react";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeContent,
  ServiceItem,
  SkillCategory,
  SocialLink,
} from "@/types/resume";
import { createId } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

type Tab =
  | "profile"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications"
  | "services"
  | "contact"
  | "social"
  | "sections"
  | "seo";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Social" },
  { id: "sections", label: "Sections" },
  { id: "seo", label: "SEO" },
];

export function AdminEditor({
  initialContent,
  onLogout,
}: {
  initialContent: ResumeContent;
  onLogout: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dirtyHint = useMemo(() => status, [status]);

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error || "Save failed");
        return;
      }
      setStatus("Saved successfully");
    } catch {
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setStatus(data.error || "Upload failed");
        return;
      }
      setContent((prev) => ({
        ...prev,
        profile: { ...prev.profile, photoUrl: data.url! },
      }));
      setStatus("Photo uploaded — remember to save");
    } catch {
      setStatus("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    setContent((prev) => {
      const sections = [...prev.sections];
      const target = index + direction;
      if (target < 0 || target >= sections.length) return prev;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...prev, sections };
    });
  }

  return (
    <div className="min-h-[100svh] pb-16">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--glass-strong)] backdrop-blur-xl">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-semibold tracking-tight">Admin Panel</p>
            <p className="text-xs text-[var(--muted)]">
              Edit content · public page updates after save
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <a href="/" className="btn btn-ghost focus-ring !py-2 text-sm" target="_blank">
              View site
            </a>
            <button
              type="button"
              className="btn btn-ghost focus-ring !py-2 text-sm"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              type="button"
              className="btn btn-primary focus-ring !py-2 text-sm"
              onClick={save}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="glass h-fit rounded-2xl p-2 lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin sections">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  tab === item.id
                    ? "bg-[var(--glass-fill-strong)] font-medium text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          {dirtyHint && (
            <p
              className="text-sm"
              style={{
                color: dirtyHint.includes("fail") || dirtyHint.includes("Invalid") || dirtyHint.includes("not configured")
                  ? "var(--danger)"
                  : "var(--success)",
              }}
            >
              {dirtyHint}
            </p>
          )}

          {tab === "profile" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <Field
                label="Name"
                value={content.profile.name}
                onChange={(v) =>
                  setContent((p) => ({ ...p, profile: { ...p.profile, name: v } }))
                }
              />
              <Field
                label="Title"
                value={content.profile.title}
                onChange={(v) =>
                  setContent((p) => ({ ...p, profile: { ...p.profile, title: v } }))
                }
              />
              <Field
                label="Tagline"
                value={content.profile.tagline}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    profile: { ...p.profile, tagline: v },
                  }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Location"
                  value={content.profile.location}
                  onChange={(v) =>
                    setContent((p) => ({
                      ...p,
                      profile: { ...p.profile, location: v },
                    }))
                  }
                />
                <Field
                  label="Email"
                  value={content.profile.email}
                  onChange={(v) =>
                    setContent((p) => ({
                      ...p,
                      profile: { ...p.profile, email: v },
                    }))
                  }
                />
                <Field
                  label="Phone"
                  value={content.profile.phone}
                  onChange={(v) =>
                    setContent((p) => ({
                      ...p,
                      profile: { ...p.profile, phone: v },
                    }))
                  }
                />
              </div>
              <div>
                <p className="mb-1.5 text-sm text-[var(--muted)]">Profile photo</p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="btn btn-ghost focus-ring cursor-pointer !py-2 text-sm">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadPhoto(file);
                      }}
                    />
                  </label>
                  {content.profile.photoUrl && (
                    <button
                      type="button"
                      className="btn btn-ghost focus-ring !py-2 text-sm"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          profile: { ...p.profile, photoUrl: "" },
                        }))
                      }
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                {content.profile.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content.profile.photoUrl}
                    alt="Profile preview"
                    className="mt-4 h-32 w-32 rounded-2xl object-cover"
                  />
                )}
              </div>
            </GlassCard>
          )}

          {tab === "about" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <Field
                label="Heading"
                value={content.about.heading}
                onChange={(v) =>
                  setContent((p) => ({ ...p, about: { ...p.about, heading: v } }))
                }
              />
              <TextArea
                label="Body"
                value={content.about.body}
                onChange={(v) =>
                  setContent((p) => ({ ...p, about: { ...p.about, body: v } }))
                }
                rows={10}
              />
            </GlassCard>
          )}

          {tab === "experience" && (
            <ListEditor
              heading={content.experience.heading}
              onHeading={(v) =>
                setContent((p) => ({
                  ...p,
                  experience: { ...p.experience, heading: v },
                }))
              }
              onAdd={() =>
                setContent((p) => ({
                  ...p,
                  experience: {
                    ...p.experience,
                    items: [
                      {
                        id: createId("exp"),
                        title: "Role",
                        company: "Company",
                        location: "",
                        startDate: "",
                        endDate: "",
                        bullets: [""],
                      },
                      ...p.experience.items,
                    ],
                  },
                }))
              }
            >
              {content.experience.items.map((item, index) => (
                <ExperienceEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const items = [...p.experience.items];
                      items[index] = next;
                      return { ...p, experience: { ...p.experience, items } };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      experience: {
                        ...p.experience,
                        items: p.experience.items.filter((x) => x.id !== item.id),
                      },
                    }))
                  }
                />
              ))}
            </ListEditor>
          )}

          {tab === "projects" && (
            <ListEditor
              heading={content.projects.heading}
              onHeading={(v) =>
                setContent((p) => ({
                  ...p,
                  projects: { ...p.projects, heading: v },
                }))
              }
              onAdd={() =>
                setContent((p) => ({
                  ...p,
                  projects: {
                    ...p.projects,
                    items: [
                      {
                        id: createId("proj"),
                        name: "Project",
                        role: "",
                        status: "Ongoing",
                        description: "",
                        bullets: [""],
                      },
                      ...p.projects.items,
                    ],
                  },
                }))
              }
            >
              {content.projects.items.map((item, index) => (
                <ProjectEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const items = [...p.projects.items];
                      items[index] = next;
                      return { ...p, projects: { ...p.projects, items } };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      projects: {
                        ...p.projects,
                        items: p.projects.items.filter((x) => x.id !== item.id),
                      },
                    }))
                  }
                />
              ))}
            </ListEditor>
          )}

          {tab === "skills" && (
            <ListEditor
              heading={content.skills.heading}
              onHeading={(v) =>
                setContent((p) => ({
                  ...p,
                  skills: { ...p.skills, heading: v },
                }))
              }
              onAdd={() =>
                setContent((p) => ({
                  ...p,
                  skills: {
                    ...p.skills,
                    categories: [
                      {
                        id: createId("sk"),
                        name: "Category",
                        items: ["Skill"],
                      },
                      ...p.skills.categories,
                    ],
                  },
                }))
              }
            >
              {content.skills.categories.map((item, index) => (
                <SkillEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const categories = [...p.skills.categories];
                      categories[index] = next;
                      return { ...p, skills: { ...p.skills, categories } };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      skills: {
                        ...p.skills,
                        categories: p.skills.categories.filter(
                          (x) => x.id !== item.id,
                        ),
                      },
                    }))
                  }
                />
              ))}
            </ListEditor>
          )}

          {tab === "education" && (
            <ListEditor
              heading={content.education.heading}
              onHeading={(v) =>
                setContent((p) => ({
                  ...p,
                  education: { ...p.education, heading: v },
                }))
              }
              onAdd={() =>
                setContent((p) => ({
                  ...p,
                  education: {
                    ...p.education,
                    items: [
                      {
                        id: createId("edu"),
                        degree: "Degree",
                        institution: "Institution",
                        startDate: "",
                        endDate: "",
                      },
                      ...p.education.items,
                    ],
                  },
                }))
              }
            >
              {content.education.items.map((item, index) => (
                <EducationEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const items = [...p.education.items];
                      items[index] = next;
                      return { ...p, education: { ...p.education, items } };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      education: {
                        ...p.education,
                        items: p.education.items.filter((x) => x.id !== item.id),
                      },
                    }))
                  }
                />
              ))}
            </ListEditor>
          )}

          {tab === "certifications" && (
            <ListEditor
              heading={content.certifications.heading}
              onHeading={(v) =>
                setContent((p) => ({
                  ...p,
                  certifications: { ...p.certifications, heading: v },
                }))
              }
              onAdd={() =>
                setContent((p) => ({
                  ...p,
                  certifications: {
                    ...p.certifications,
                    items: [
                      {
                        id: createId("cert"),
                        name: "Certification",
                        issuer: "Issuer",
                      },
                      ...p.certifications.items,
                    ],
                  },
                }))
              }
            >
              {content.certifications.items.map((item, index) => (
                <CertEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const items = [...p.certifications.items];
                      items[index] = next;
                      return {
                        ...p,
                        certifications: { ...p.certifications, items },
                      };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      certifications: {
                        ...p.certifications,
                        items: p.certifications.items.filter(
                          (x) => x.id !== item.id,
                        ),
                      },
                    }))
                  }
                />
              ))}
            </ListEditor>
          )}

          {tab === "services" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <Field
                label="Heading"
                value={content.services.heading}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    services: { ...p.services, heading: v },
                  }))
                }
              />
              <TextArea
                label="Description"
                value={content.services.description}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    services: { ...p.services, description: v },
                  }))
                }
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-ghost focus-ring !py-2 text-sm"
                  onClick={() =>
                    setContent((p) => ({
                      ...p,
                      services: {
                        ...p.services,
                        items: [
                          {
                            id: createId("svc"),
                            title: "Service",
                            description: "",
                          },
                          ...p.services.items,
                        ],
                      },
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add service
                </button>
              </div>
              {content.services.items.map((item, index) => (
                <ServiceEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const items = [...p.services.items];
                      items[index] = next;
                      return { ...p, services: { ...p.services, items } };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      services: {
                        ...p.services,
                        items: p.services.items.filter((x) => x.id !== item.id),
                      },
                    }))
                  }
                />
              ))}
            </GlassCard>
          )}

          {tab === "contact" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <Field
                label="Heading"
                value={content.contact.heading}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    contact: { ...p.contact, heading: v },
                  }))
                }
              />
              <TextArea
                label="Description"
                value={content.contact.description}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    contact: { ...p.contact, description: v },
                  }))
                }
              />
              <Field
                label="Email"
                value={content.contact.email}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    contact: { ...p.contact, email: v },
                  }))
                }
              />
              <Field
                label="Phone"
                value={content.contact.phone}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    contact: { ...p.contact, phone: v },
                  }))
                }
              />
              <Field
                label="Location"
                value={content.contact.location}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    contact: { ...p.contact, location: v },
                  }))
                }
              />
            </GlassCard>
          )}

          {tab === "social" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-ghost focus-ring !py-2 text-sm"
                  onClick={() =>
                    setContent((p) => ({
                      ...p,
                      socialLinks: [
                        {
                          id: createId("social"),
                          label: "Link",
                          url: "https://",
                          icon: "website",
                        },
                        ...p.socialLinks,
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add link
                </button>
              </div>
              {content.socialLinks.map((item, index) => (
                <SocialEditor
                  key={item.id}
                  item={item}
                  onChange={(next) =>
                    setContent((p) => {
                      const socialLinks = [...p.socialLinks];
                      socialLinks[index] = next;
                      return { ...p, socialLinks };
                    })
                  }
                  onRemove={() =>
                    setContent((p) => ({
                      ...p,
                      socialLinks: p.socialLinks.filter((x) => x.id !== item.id),
                    }))
                  }
                />
              ))}
            </GlassCard>
          )}

          {tab === "sections" && (
            <GlassCard className="space-y-3 p-5 sm:p-6">
              <p className="text-sm text-[var(--muted)]">
                Toggle visibility and reorder sections.
              </p>
              {content.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="glass flex items-center gap-2 rounded-2xl p-3"
                >
                  <div className="flex-1">
                    <Field
                      label="Label"
                      value={section.label}
                      onChange={(v) =>
                        setContent((p) => {
                          const sections = [...p.sections];
                          sections[index] = { ...section, label: v };
                          return { ...p, sections };
                        })
                      }
                    />
                    <p className="mt-1 text-xs text-[var(--faint)]">
                      id: {section.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost focus-ring !px-3 !py-2"
                    onClick={() =>
                      setContent((p) => {
                        const sections = [...p.sections];
                        sections[index] = {
                          ...section,
                          visible: !section.visible,
                        };
                        return { ...p, sections };
                      })
                    }
                    aria-label="Toggle visibility"
                  >
                    {section.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost focus-ring !px-3 !py-2"
                    onClick={() => moveSection(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost focus-ring !px-3 !py-2"
                    onClick={() => moveSection(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </GlassCard>
          )}

          {tab === "seo" && (
            <GlassCard className="space-y-4 p-5 sm:p-6">
              <Field
                label="Title"
                value={content.seo.title}
                onChange={(v) =>
                  setContent((p) => ({ ...p, seo: { ...p.seo, title: v } }))
                }
              />
              <TextArea
                label="Description"
                value={content.seo.description}
                onChange={(v) =>
                  setContent((p) => ({
                    ...p,
                    seo: { ...p.seo, description: v },
                  }))
                }
              />
              <Field
                label="Site URL"
                value={content.seo.siteUrl}
                onChange={(v) =>
                  setContent((p) => ({ ...p, seo: { ...p.seo, siteUrl: v } }))
                }
              />
              <Field
                label="OG image path"
                value={content.seo.ogImage}
                onChange={(v) =>
                  setContent((p) => ({ ...p, seo: { ...p.seo, ogImage: v } }))
                }
              />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--muted)]">{label}</span>
      <input
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--muted)]">{label}</span>
      <textarea
        className="input-field resize-y"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ListEditor({
  heading,
  onHeading,
  onAdd,
  children,
}: {
  heading: string;
  onHeading: (value: string) => void;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <GlassCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex-1">
          <Field label="Section heading" value={heading} onChange={onHeading} />
        </div>
        <button
          type="button"
          className="btn btn-ghost focus-ring !py-2 text-sm"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </GlassCard>
      {children}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn btn-ghost focus-ring !px-3 !py-2 text-sm"
      onClick={onClick}
      style={{ color: "var(--danger)" }}
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  );
}

function ExperienceEditor({
  item,
  onChange,
  onRemove,
}: {
  item: ExperienceItem;
  onChange: (item: ExperienceItem) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.title || "Experience"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" value={item.title} onChange={(v) => onChange({ ...item, title: v })} />
        <Field label="Company" value={item.company} onChange={(v) => onChange({ ...item, company: v })} />
        <Field label="Location" value={item.location} onChange={(v) => onChange({ ...item, location: v })} />
        <Field label="Start" value={item.startDate} onChange={(v) => onChange({ ...item, startDate: v })} />
        <Field label="End" value={item.endDate} onChange={(v) => onChange({ ...item, endDate: v })} />
      </div>
      <TextArea
        label="Bullets (one per line)"
        value={item.bullets.join("\n")}
        rows={8}
        onChange={(v) =>
          onChange({
            ...item,
            bullets: v.split("\n").map((line) => line.trim()).filter(Boolean),
          })
        }
      />
    </GlassCard>
  );
}

function ProjectEditor({
  item,
  onChange,
  onRemove,
}: {
  item: ProjectItem;
  onChange: (item: ProjectItem) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.name || "Project"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
        <Field label="Role" value={item.role} onChange={(v) => onChange({ ...item, role: v })} />
        <Field label="Status" value={item.status} onChange={(v) => onChange({ ...item, status: v })} />
      </div>
      <TextArea label="Description" value={item.description} onChange={(v) => onChange({ ...item, description: v })} />
      <TextArea
        label="Bullets (one per line)"
        value={item.bullets.join("\n")}
        rows={6}
        onChange={(v) =>
          onChange({
            ...item,
            bullets: v.split("\n").map((line) => line.trim()).filter(Boolean),
          })
        }
      />
    </GlassCard>
  );
}

function SkillEditor({
  item,
  onChange,
  onRemove,
}: {
  item: SkillCategory;
  onChange: (item: SkillCategory) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.name || "Skills"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <Field label="Category" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
      <TextArea
        label="Skills (one per line)"
        value={item.items.join("\n")}
        onChange={(v) =>
          onChange({
            ...item,
            items: v.split("\n").map((line) => line.trim()).filter(Boolean),
          })
        }
      />
    </GlassCard>
  );
}

function EducationEditor({
  item,
  onChange,
  onRemove,
}: {
  item: EducationItem;
  onChange: (item: EducationItem) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.degree || "Education"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Degree" value={item.degree} onChange={(v) => onChange({ ...item, degree: v })} />
        <Field label="Institution" value={item.institution} onChange={(v) => onChange({ ...item, institution: v })} />
        <Field label="Start" value={item.startDate} onChange={(v) => onChange({ ...item, startDate: v })} />
        <Field label="End" value={item.endDate} onChange={(v) => onChange({ ...item, endDate: v })} />
      </div>
      <TextArea
        label="Details"
        value={item.details || ""}
        onChange={(v) => onChange({ ...item, details: v })}
      />
    </GlassCard>
  );
}

function CertEditor({
  item,
  onChange,
  onRemove,
}: {
  item: CertificationItem;
  onChange: (item: CertificationItem) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.name || "Certification"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <Field label="Name" value={item.name} onChange={(v) => onChange({ ...item, name: v })} />
      <Field label="Issuer" value={item.issuer} onChange={(v) => onChange({ ...item, issuer: v })} />
    </GlassCard>
  );
}

function ServiceEditor({
  item,
  onChange,
  onRemove,
}: {
  item: ServiceItem;
  onChange: (item: ServiceItem) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.title || "Service"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <Field label="Title" value={item.title} onChange={(v) => onChange({ ...item, title: v })} />
      <TextArea label="Description" value={item.description} onChange={(v) => onChange({ ...item, description: v })} />
    </GlassCard>
  );
}

function SocialEditor({
  item,
  onChange,
  onRemove,
}: {
  item: SocialLink;
  onChange: (item: SocialLink) => void;
  onRemove: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-5">
      <div className="flex justify-between gap-3">
        <h3 className="text-sm font-semibold">{item.label || "Social"}</h3>
        <RemoveButton onClick={onRemove} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Label" value={item.label} onChange={(v) => onChange({ ...item, label: v })} />
        <Field label="URL" value={item.url} onChange={(v) => onChange({ ...item, url: v })} />
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--muted)]">Icon</span>
          <select
            className="input-field"
            value={item.icon}
            onChange={(e) =>
              onChange({
                ...item,
                icon: e.target.value as SocialLink["icon"],
              })
            }
          >
            <option value="github">GitHub</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="website">Website</option>
            <option value="x">X</option>
          </select>
        </label>
      </div>
    </GlassCard>
  );
}
