import { z } from "zod";
import { isBreachedPassword, isPasswordValid } from "./password";

const email = z.string().trim().min(1, "Enter your email.").pipe(z.email("Enter a valid email address."));

const newPassword = z
  .string()
  .refine(isPasswordValid, "Choose a password that meets all the requirements.")
  .refine((value) => !isBreachedPassword(value), "This password appeared in a data breach. Choose another one.");

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
  rememberDevice: checkbox,
});

export const backupCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/, "Enter a backup code like 7F3K-9QXA."),
  rememberDevice: checkbox,
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email,
  password: newPassword,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.confirmPassword === values.password, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const currentPasswordSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

export const savedViewSchema = z.object({
  name: z.string().trim().min(1, "Name this view.").max(40, "Keep the name under 40 characters."),
});

const channelName = z.string().trim().min(1, "Name this channel.").max(40, "Keep the name under 40 characters.");

const recipients = z
  .string()
  .trim()
  .min(1, "Add at least one recipient.")
  .refine(
    (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .every((item) => z.email().safeParse(item).success),
    "Enter valid email addresses, separated by commas.",
  );

function webhookUrl(prefix: string, message: string) {
  return z
    .string()
    .trim()
    .min(1, "Paste the webhook URL.")
    .refine((value) => value.startsWith(prefix), message);
}

export const alertChannelSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), name: channelName, target: recipients }),
  z.object({
    type: z.literal("slack"),
    name: channelName,
    target: webhookUrl("https://hooks.slack.com/", "Use a Slack incoming webhook (https://hooks.slack.com/…)."),
  }),
  z.object({
    type: z.literal("discord"),
    name: channelName,
    target: webhookUrl(
      "https://discord.com/api/webhooks/",
      "Use a Discord webhook (https://discord.com/api/webhooks/…).",
    ),
  }),
  z.object({
    type: z.literal("webhook"),
    name: channelName,
    target: webhookUrl("https://", "Use an https:// URL.").pipe(z.url("Enter a valid URL.")),
    method: z.enum(["POST", "PUT"]),
  }),
]);

export const newStatusPageSchema = z.object({
  project: z.string().min(1, "Pick a project."),
  title: z.string().trim().min(1, "Give the page a title.").max(60, "Keep the title under 60 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(40, "Keep the slug under 40 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens."),
});

const idList = z
  .string()
  .optional()
  .transform((value) => value?.split(",").filter(Boolean) ?? []);

export const declareIncidentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the incident a short title.")
      .max(120, "Keep the title under 120 characters."),
    severity: z.enum(["minor", "major", "critical"]),
    status: z.enum(["investigating", "identified", "monitoring"]),
    monitorIds: idList,
    assignee: z
      .string()
      .optional()
      .transform((value) => value || null),
    message: z.string().trim().max(2000, "Keep the message under 2,000 characters."),
    publish: checkbox,
    notify: checkbox,
    channelIds: idList,
  })
  .refine((values) => !values.notify || values.channelIds.length > 0, {
    message: "Pick at least one channel to notify.",
    path: ["channelIds"],
  });

export const incidentUpdateSchema = z.object({
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
  message: z.string().trim().min(1, "Write an update first.").max(2000, "Keep the update under 2,000 characters."),
  isPublic: checkbox,
});

export const subscribeSchema = z.object({ email });

const slug = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(40, "Keep the slug under 40 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.");

export const orgSettingsSchema = z.object({
  name: z.string().trim().min(1, "Name your organization.").max(60, "Keep the name under 60 characters."),
  slug,
  timezone: z.string().min(1, "Pick a timezone."),
});

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Name the project.").max(50, "Keep the name under 50 characters."),
  slug,
  description: z.string().trim().max(200, "Keep the description under 200 characters."),
  tags: idList,
});

export const roleDetailsSchema = z.object({
  name: z.string().trim().min(1, "Name the role.").max(40, "Keep the name under 40 characters."),
  description: z.string().trim().max(140, "Keep the description under 140 characters."),
});

export const apiKeySchema = z.object({
  name: z.string().trim().min(1, "Name the key so you can recognise it later.").max(50, "Keep it under 50 characters."),
  permissions: idList.refine((values) => values.length > 0, "Pick at least one scope."),
  projects: idList,
  expiry: z.string(),
});

export const maintenanceSchema = z
  .object({
    title: z.string().trim().min(1, "Give the window a title.").max(80, "Keep the title under 80 characters."),
    project: z.string().min(1, "Pick a project."),
    description: z.string().trim().max(1000, "Keep the description under 1,000 characters."),
    monitorIds: idList.refine((values) => values.length > 0, "Pick at least one monitor."),
    startsAt: z.coerce.number().positive("Pick a start time."),
    endsAt: z.coerce.number().positive("Pick an end time."),
    timezone: z.string().min(1),
    freq: z.enum(["none", "daily", "weekly"]),
    weekdays: idList,
    until: z.coerce.number(),
    showOnStatusPage: checkbox,
  })
  .refine((values) => values.endsAt > values.startsAt, { message: "End must be after the start.", path: ["endsAt"] })
  .refine((values) => values.freq !== "weekly" || values.weekdays.length > 0, {
    message: "Pick at least one weekday.",
    path: ["weekdays"],
  })
  .refine((values) => !values.until || values.until > values.startsAt, {
    message: "Repeat until must be after the start.",
    path: ["until"],
  });

export type MaintenanceValues = z.output<typeof maintenanceSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Keep your name under 80 characters."),
  timezone: z.string().min(1, "Pick a timezone."),
});

export const changeEmailSchema = z.object({
  email,
  password: z.string().min(1, "Enter your current password."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: newPassword,
    confirmPassword: z.string(),
    signOutOthers: checkbox,
  })
  .refine((values) => values.confirmPassword === values.password, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.password !== values.currentPassword, {
    message: "Choose a password you haven't used here.",
    path: ["password"],
  });

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Name the organization.").max(60, "Keep the name under 60 characters."),
  slug,
});

export const totpCodeSchema = twoFactorSchema.pick({ code: true });
