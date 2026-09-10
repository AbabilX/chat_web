"use client";

import { useState } from "react";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useAssetMenu } from "@/components/shared/use-asset-menu";
import { copyTextToClipboard, openExternal } from "@/lib/files/asset-actions";
import { formatLinkPreviewDate } from "@/lib/text/link-preview-date";
import { useLinkPreview } from "@/lib/text/use-link-preview";
import { forgetPreviewImage, usePreviewImage } from "@/lib/text/use-preview-image";
import { cn } from "@/lib/utils";
import { isFullSizePreviewImage } from "./full-size-image";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Signal Desktop's `.module-message__link-preview`, ported element for element
 * from `Message.dom.tsx` and `_modules.scss`.
 *
 * The shape is a full-size image ABOVE a content row; the row is
 * `flex-direction: row; align-items: center` holding the 72px thumbnail and
 * then the text — the two layouts are exclusive, so a card has either the
 * image on top or the square beside the title, never both. The text block is
 * `min-width: 0` because a long unbroken URL in a title would otherwise push
 * the thumbnail out of the bubble.
 *
 * Numbers are Signal's, and ours match because our bubble padding is its
 * padding: 8px/12px, hence the -12px inline margin and `100% + 24px` width
 * that make the card bleed to the bubble's edges, and the -8px top margin that
 * pulls it up into the bubble's own padding. Type is font-body-1-bold for the
 * title (14/20, 600, -0.08px) and font-body-2 for the description and footer
 * (13/18, -0.03px).
 *
 * Three things are deliberate and easy to get wrong:
 *
 * It sits ABOVE the message text — the card is what the message is about, and
 * the text is the author's comment on it.
 *
 * It does NOT take the bubble's colour. Signal emits `--incoming` /
 * `--outgoing` classes and then defines no rules for either: the content row
 * is `--sig-preview-card`, one notch from the bubble in both themes — darker
 * in dark, lighter in light, which is Signal's own gray-80-on-gray-75 and
 * gray-02-on-gray-05. Tinting it to the bubble is what makes it look like a
 * rendering fault instead of a card.
 *
 * Its picture is downloaded by Rust and drawn from local bytes, never fetched
 * by the `<img>` tag itself — see `use-preview-image.ts`.
 */
export default function ChatLinkPreview({
  url,
  contentAbove,
}: {
  url: string;
  /** An author line or a quote already sits above, so the bleed stops short. */
  contentAbove: boolean;
}) {
  const { meta, loading } = useLinkPreview(url);
  // Called before the early returns below, and given undefined until there is
  // something to download — a hook cannot be conditional.
  const picture = usePreviewImage(meta?.image);
  const [broken, setBroken] = useState(false);
  // The card's own right-click is about the PAGE, never the picture: the
  // og:image belongs to a third party and only Rust is allowed to touch it.
  const menu = useAssetMenu({
    extra: [
      {
        key: "open",
        label: "Open in browser",
        icon: <ExternalLink size={17} />,
        onSelect: () => void openExternal(url),
      },
      {
        key: "copy",
        label: "Copy link",
        icon: <LinkIcon size={17} />,
        onSelect: () => {
          void copyTextToClipboard(url).then(
            () => toast.success("Link copied"),
            () => toast.error("Could not copy the link"),
          );
        },
      },
    ],
  });

  const bleed = cn(
    "-mx-3 mb-[5px] block w-[calc(100%+24px)] overflow-hidden",
    contentAbove ? "mt-1" : "-mt-2",
  );

  if (loading) {
    return (
      <div className={bleed}>
        <div className="h-[74px] animate-pulse" style={{ background: "var(--sig-preview-card)" }} />
      </div>
    );
  }
  if (!meta) return null;

  const showImage = picture !== null && !broken;
  // Signal's rule, decided before the first paint because the picture arrives
  // already measured: a hero only when the image is big enough to be one and
  // is not roughly square. A square is a logo, and a logo blown up to 300px is
  // worse than the 72px thumbnail it should have stayed.
  const hero = showImage && isFullSizePreviewImage(picture.width, picture.height);
  const thumbnail = showImage && !hero;

  const onError = () => {
    // The blob was released (see MAX_HELD). Dropping it lets the next mount
    // ask Rust again, which usually answers from its disk copy.
    if (meta.image) forgetPreviewImage(meta.image);
    setBroken(true);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onContextMenu={menu.onContextMenu}
      className={cn(bleed, "cursor-pointer no-underline")}
      style={{ color: "var(--sig-label)" }}>
      {menu.menu}
      {hero ? (
        <img
          src={picture.src}
          alt=""
          onError={onError}
          // Signal's timeline bounds: at most 450px tall, never under 50.
          className="block max-h-[450px] min-h-[50px] w-full object-cover"
        />
      ) : null}
      <div
        dir="auto"
        className="flex flex-row items-center px-3 py-2"
        style={{ background: "var(--sig-preview-card)" }}>
        {thumbnail ? (
          // `-m-0.5` is Signal's: the square eats 2px of the row's padding on
          // every side, so it sits tighter than the text does.
          <img
            src={picture.src}
            alt=""
            onError={onError}
            className="-m-0.5 me-2 h-[72px] w-[72px] shrink-0 rounded object-cover"
          />
        ) : null}
        <div className={cn("min-w-0", thumbnail && "mt-[5px]")}>
          <p className="line-clamp-2 overflow-hidden text-[14px] font-semibold leading-[20px] tracking-[-0.08px]">
            {meta.title}
          </p>
          {meta.description ? (
            <p className="mt-1 line-clamp-5 overflow-hidden break-words text-[13px] leading-[18px] tracking-[-0.03px]">
              {meta.description}
            </p>
          ) : null}
          <div
            className="mt-0.5 flex flex-row flex-wrap items-center text-[13px] leading-[18px] tracking-[-0.03px]"
            style={{ color: "var(--sig-label-2)" }}>
            <span className="lowercase">{domainOf(url)}</span>
            {meta.date ? (
              <>
                {/* Signal's `> *:not(:first-child):before` — a half-size dot
                    with 0.2rem either side. */}
                <span aria-hidden className="mx-[0.2rem] text-[50%]">
                  •
                </span>
                <time dateTime={new Date(meta.date).toISOString()}>
                  {formatLinkPreviewDate(meta.date)}
                </time>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </a>
  );
}
