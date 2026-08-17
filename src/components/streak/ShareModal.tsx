"use client";

import { X, Share2, Copy, Check, Twitter, Facebook } from "lucide-react";
import { useState } from "react";
import { generateShareText } from "@/lib/utils";

interface ShareModalProps {
  streak: number;
  referralCode: string;
  onClose: () => void;
}

export default function ShareModal({ streak, referralCode, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = generateShareText(streak, referralCode);
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://life-os.pages.dev"}?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Life OS — Streak Achievement",
        text: shareText,
        url: shareUrl,
      });
    } else {
      handleCopy();
    }
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80"
        onClick={onClose}
      />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:max-w-md md:mx-auto z-50">
        <div className="terminal-card p-6 text-center border border-amber-400/50 bg-surface-card relative">
          <button onClick={onClose}
            className="absolute top-3 right-3 p-1 border border-surface-border text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>

          {/* Achievement Card Header */}
          <div className="mb-5">
            <div className="text-5xl mb-2">🔥</div>
            <h2 className="text-xl font-bold mono-tag text-amber-400">
              {streak} NGÀY STREAK LIÊN TỤC!
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              Bạn đang trên đà làm việc năng suất. Chia sẻ thành tích đến bạn bè!
            </p>
          </div>

          {/* Share Card Preview */}
          <div className="p-4 mb-4 text-left border border-amber-400/30 bg-surface-dark font-mono text-xs text-amber-200">
            {shareText}
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleNativeShare}
              id="share-native-btn"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 border border-emerald-400">
              <Share2 className="w-4 h-4 fill-black" />
              CHIA SẺ
            </button>

            <button
              onClick={handleCopy}
              id="share-copy-btn"
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold mono-tag border transition-all"
              style={{
                background: copied ? "oklch(0.72 0.22 142 / 0.2)" : "oklch(0.14 0.018 260)",
                borderColor: copied ? "oklch(0.72 0.22 142)" : "oklch(0.28 0.035 260)",
                color: copied ? "oklch(0.96 0.01 142)" : "oklch(0.85 0.01 260)",
              }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "ĐÃ SAO CHÉP" : "SAO CHÉP LINK"}
            </button>
          </div>

          <div className="flex gap-2 text-xs font-semibold mono-tag">
            <button onClick={handleTwitter}
              className="flex-1 py-1.5 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400 hover:text-black flex items-center justify-center gap-1 transition-all">
              <Twitter className="w-3.5 h-3.5" />
              TWITTER / X
            </button>
            <button onClick={handleFacebook}
              className="flex-1 py-1.5 border border-blue-400/40 text-blue-400 hover:bg-blue-400 hover:text-black flex items-center justify-center gap-1 transition-all">
              <Facebook className="w-3.5 h-3.5" />
              FACEBOOK
            </button>
          </div>

          <p className="text-[10px] mono-tag mt-3 text-gray-500">
            Ref code: {referralCode}
          </p>
        </div>
      </div>
    </>
  );
}
