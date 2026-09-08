"use client";

import { Github01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { loginWithGitHub, loginWithGoogle } from "@/lib/api";
import GoogleIcon from "./google-icon";

const LOGIN_PROVIDERS = [
  {
    id: "google",
    label: "Continue with Google",
    onClick: loginWithGoogle,
    icon: <GoogleIcon size={16} />,
    variant: "default" as const,
  },
  {
    id: "github",
    label: "Continue with GitHub",
    onClick: loginWithGitHub,
    icon: <Github01Icon size={16} />,
    variant: "outline" as const,
  },
];

export default function LoginActions() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {LOGIN_PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          size="lg"
          variant={provider.variant}
          className="w-full gap-2"
          onClick={provider.onClick}
        >
          {provider.icon}
          <span>{provider.label}</span>
        </Button>
      ))}
    </div>
  );
}
