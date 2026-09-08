import Image from "next/image";
import { LOGIN_COPY } from "./login-copy";

export default function LoginNavbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <span className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="shrink-0 object-contain"
          />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            {LOGIN_COPY.brand}
          </span>
        </span>
      </div>
    </nav>
  );
}
