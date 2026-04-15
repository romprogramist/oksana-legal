import Image from "next/image";
import { CONTACT } from "@/lib/constants";

export default function FloatingMax() {
  return (
    <a
      href={CONTACT.max}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в МАКС"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] text-white bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]"
    >
      <Image
        src="/icons/max.svg"
        alt=""
        width={28}
        height={28}
        className="brightness-0 invert"
      />
    </a>
  );
}
