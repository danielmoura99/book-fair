"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4 text-3xl">
      {/* ESQUERDA */}
      <div className="flex items-center gap-10">
        <Image src="/LogoFLE.png" width={110} height={39} alt="FLE Control" />
        <Image src="/LogoFLEI.png" width={110} height={39} alt="FLEI Control" />

        <div className="flex flex-col">
          <Link
            href="/"
            className={
              pathname === "/" ? "font-bold text-primary" : "text-balance"
            }
          >
            54º Feira do Livro Espírita
          </Link>
          <span className="text-xl ">31º Feira do Livro Espírita Infantil</span>
        </div>
        <Image src="/logouse.png" width={110} height={39} alt="FLE Control" />
      </div>

      {/* ESQUERDA */}
    </nav>
  );
};

export default Navbar;
