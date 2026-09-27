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

export const linkAccountSchema = z.object({
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
