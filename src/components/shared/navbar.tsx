import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  HiHeart,
  HiHome,
  HiMagnifyingGlass,
  HiMiniPencilSquare,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiPencilSquare,
} from "react-icons/hi2";
function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    {
      name: "Home",
      href: "/",
      icon: <HiOutlineHome className="h-8 w-8 md:h-7 md:w-7" />,
      activeIcon: <HiHome className="h-8 w-8 md:h-7 md:w-7" />,
      private: false,
    },
    {
      name: "Search",
      href: "/search",
      icon: <HiOutlineMagnifyingGlass className="h-8 w-8 md:h-7 md:w-7" />,
      activeIcon: <HiMagnifyingGlass className="h-8 w-8 md:h-7 md:w-7" />,
      private: false,
    },
    {
      name: "Create a Thread",
      href: "/threads/new",
      icon: <HiPencilSquare className="h-8 w-8 md:h-7 md:w-7" />,
      activeIcon: <HiMiniPencilSquare className="h-8 w-8 md:h-7 md:w-7" />,
      private: true,
    },
    {
      name: "Notifications",
      href: `/notifications`,
      icon: <HiOutlineHeart className="h-8 w-8 md:h-7 md:w-7" />,
      activeIcon: <HiHeart className="h-8 w-8 md:h-7 md:w-7" />,
      private: false,
    },
    {
      name: "Profile",
      href: `/profile/${session?.user.id as string}`,
      icon: displayProfileImage(),
      activeIcon: displayProfileImage(),
      private: true,
    },
  ];

  function displayProfileImage() {
    if (!session?.user) {
      return <HiOutlineUser className="h-8 w-8 rounded-full md:h-7 md:w-7" />;
    }

    return (
      <div className="h-6 w-6 overflow-hidden rounded-full">
        <Image
          src={session?.user.image as string}
          alt="Profile Image"
          fill
          className="!relative h-full w-full object-cover"
        />
      </div>
    );
  }

  function onChangeTheme(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }

  function displayLink(link: {
    name: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    private: boolean;
  }) {
    const active = pathname === link.href;

    if (link.private && !session?.user) return null;

    return (
      <li
        key={link.name}
        className={`rounded-lg hover:bg-accent ${active ? "bg-accent" : ""}`}
      >
        <Link
          href={link.href}
          className={`flex items-center gap-2 px-2 py-2 text-lg text-foreground ${
            active ? "font-bold" : ""
          }`}
        >
          <span>{active ? link.activeIcon : link.icon}</span>
          <span className="hidden font-medium lg:block">{link.name}</span>
        </Link>
      </li>
    );
  }

  return (
    <header className="fixed bottom-0 left-0 z-50 h-20 w-full border-r bg-background px-4 py-6 md:bottom-auto md:top-0 md:h-screen md:w-20 lg:w-[330px]">
      <nav className="mx-auto flex h-full w-full max-w-5xl flex-row justify-between md:flex-col">
        <div className="flex w-full items-center gap-4 md:block md:w-auto">
          <Link href="/" className="hidden items-center gap-2 md:flex">
            <div className="h-10 w-10">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7cFYYdnIE7OeUJS72sOI4_CpDu-pywbSMjVN92DYgsSJKAmhHKiHKvgAZ6C7SCFavCwLeAwvQG2PH9CrVEj4b55sKuPUC5fhIUVk0SUS4k3OwGMosNz7Pr_HjE-pYE6gk1NY8L_Prf3r8LoivXBrPVbfj8_VNIuxHes7_Dme-SzKekL0h_X879lYMAI2s/w372-h413-p-k-no-nu/Threads%20Logo.png"
                fill
                alt="Logo"
                className={`inverted-logo !relative h-full w-full object-contain`}
              />
            </div>
            <span className="hidden text-xl font-semibold lg:block">
              Threads
            </span>
          </Link>

          <div className="w-full md:mt-8 md:w-auto">
            <ul className="flex w-full justify-between gap-2 md:w-auto md:flex-col md:justify-start">
              {links.map((link) => displayLink(link))}
              {!session?.user && (
                <li
                  className={`cursor-pointer rounded-lg hover:bg-accent`}
                  onClick={() => void signIn()}
                >
                  <div
                    className={`flex items-center gap-2 px-2 py-2 text-lg font-semibold text-foreground`}
                  >
                    <span>
                      <HiOutlineUser className="h-8 w-8 rounded-full md:h-7 md:w-7" />
                    </span>
                    <span className="hidden lg:block">Profile</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="hidden items-center justify-between md:block">
          <div className="hidden items-center gap-2 lg:block">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                value=""
                className="peer sr-only"
                onChange={(e) => onChangeTheme(e.target.checked)}
                checked={theme === "dark"}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-neutral-800"></div>
              <span className="ml-3 text-sm font-medium">Dark Mode</span>
            </label>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
