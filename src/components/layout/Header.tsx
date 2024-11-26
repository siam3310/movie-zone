"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${
        isScrolled && "bg-[#141414]"
      } fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all lg:px-10 lg:py-6`}
    >
      <div className="flex items-center space-x-8">
        <img
          src="/netflix.png"
          alt="Netflix"
          width={100}
          height={100}
          className="cursor-pointer object-contain"
        />

        <ul className="hidden space-x-4 md:flex">
          <li className="headerLink">Home</li>
          <li className="headerLink">TV Shows</li>
          <li className="headerLink">Movies</li>
          <li className="headerLink">New & Popular</li>
          <li className="headerLink">My List</li>
        </ul>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <Search className="h-6 w-6 cursor-pointer" />
        <Bell className="h-6 w-6 cursor-pointer" />
        <img
          src="https://rb.gy/g1pwyx"
          alt="Account"
          width={32}
          height={32}
          className="cursor-pointer rounded"
        />
      </div>
    </header>
  );
}
