"use client";

import ShellFrame from "./shell-frame";
import ShellProviders from "./shell-providers";
import { useUserSession } from "./use-user-session";

export default function UserShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserSession();

  return (
    <ShellProviders user={user}>
      <ShellFrame user={user}>{children}</ShellFrame>
    </ShellProviders>
  );
}
