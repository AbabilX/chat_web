"use client";

import { Camera01Icon, ImageAdd02Icon } from "hugeicons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatInitials } from "../chat-utils";
import GroupImagePicker from "./group-image-picker";
import type { GroupImageKind } from "./use-group-images";

/**
 * The group's banner with its photo overlapping the bottom edge — the same
 * arrangement a profile cover has everywhere else, so what is set here is
 * recognisably what other members will see.
 */
export default function GroupBannerField({
  name,
  avatarUrl,
  bannerUrl,
  canEdit,
  uploading,
  onPick,
}: {
  name: string;
  avatarUrl?: string;
  bannerUrl?: string;
  canEdit: boolean;
  uploading: GroupImageKind | null;
  onPick: (kind: GroupImageKind, file: File) => void;
}) {
  return (
    <div className="relative mb-10">
      <div
        className="h-28 w-full overflow-hidden rounded-xl bg-cover bg-center"
        style={{
          backgroundColor: "var(--surface-2, rgba(255,255,255,0.05))",
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
        }}
      >
        {/* Whatever the banner is, the avatar's ring has to stay visible
            against it, so the bottom of the strip is always darkened. */}
        <div className="h-full w-full bg-gradient-to-b from-transparent to-black/35" />
      </div>

      {canEdit ? (
        <GroupImagePicker
          label={bannerUrl ? "Change group banner" : "Add a group banner"}
          disabled={uploading !== null}
          onPick={(file) => onPick("banner", file)}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur disabled:opacity-60"
        >
          <ImageAdd02Icon size={13} />
          {uploading === "banner"
            ? "Uploading…"
            : bannerUrl
              ? "Change banner"
              : "Add banner"}
        </GroupImagePicker>
      ) : null}

      <div className="absolute -bottom-8 left-4">
        <div className="relative">
          <Avatar className="h-16 w-16 rounded-full ring-4 ring-[var(--surface)]">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="text-lg">
              {chatInitials(name)}
            </AvatarFallback>
          </Avatar>
          {canEdit ? (
            <GroupImagePicker
              label="Change group photo"
              disabled={uploading !== null}
              onPick={(file) => onPick("avatar", file)}
              className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[var(--indigo)] p-1.5 text-white shadow disabled:opacity-60"
            >
              <Camera01Icon size={13} />
            </GroupImagePicker>
          ) : null}
        </div>
      </div>
    </div>
  );
}
