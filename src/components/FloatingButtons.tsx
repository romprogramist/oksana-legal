import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в WhatsApp"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-white bg-accent hover:bg-accent-dark"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
      <a
        href={CONTACT.max}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в МАКС"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-white bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]"
      >
        <Image
          src="/icons/max.svg"
          alt=""
          width={28}
          height={28}
          className="brightness-0 invert"
        />
      </a>
    </div>
  );
}
