"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4 text-2xl">
      {/* ESQUERDA */}
      <div className="flex items-center gap-10">
        <Image src="/LogoFLE.png" width={110} height={39} alt="FLE Control" />
        <Image src="/Logouse.png" width={110} height={39} alt="FLE Control" />
        <Link
          href="/"
          className={
            pathname === "/" ? "font-bold text-primary" : "text-balance"
          }
        >
          FLE - Feira do Livro Espírita
        </Link>
      </div>
      {/* ESQUERDA */}
    </nav>
  );
};

export default Navbar;
