"use client";

import { useConfig } from "@/app/[locale]/config";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { SessionProps } from "@/lib/types";
import Link from "next/link";
import { LayoutSwitcher } from "../layout-switcher";
import { NavigationControls } from "../navigation-controls";
import { ProfileButton } from "./profile-button";
import { IconEverworksSimple } from "../icons/Icons";

export default function Header({ session }: SessionProps) {
  const t = useTranslations("common");
  const config = useConfig();

  const auth = config.auth;
  const providers = Object.keys(auth || {}).filter((key) =>
    auth ? !!auth[key as keyof typeof auth] : false
  );
  const icons = {
    chevron: <ChevronDown fill="currentColor" size={16} />,
  };
  return (
    <Navbar
      maxWidth="full"
      className="border-b border-gray-100 dark:border-gray-800 "
    >
      <div className="flex items-center justify-between w-full container mx-auto px-4">
        <NavbarBrand>
          <Link href="/" className="flex items-center group">
            <div className="relative  font-bold">
              <IconEverworksSimple className="w-10 h-10 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110" />
             
            </div>
            <p className="font-bold text-lg md:text-xl">{config.company_name}</p>
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <Popover placement="bottom" offset={10}>
            <NavbarItem>
              <PopoverTrigger>
                <Button
                  disableRipple
                  className="p-0 bg-transparent data-[hover=true]:bg-transparent text-gray-700 dark:text-gray-300 hover:text-theme-primary"
                  endContent={icons.chevron}
                  radius="sm"
                  variant="light"
                >
                  {t("LAYOUT")}
                </Button>
              </PopoverTrigger>
            </NavbarItem>
            <PopoverContent className="p-0 w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-theme-primary mb-1">
                    {t("LAYOUT")}
                  </h3>
                </div>

                {/* Layout Section */}
                <div className="space-y-4">
                  <LayoutSwitcher inline />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <NavbarItem>
            <Link
              aria-current="page"
              className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors"
              href="#"
            >
              {t("DISCOVER")}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors"
              href="#"
            >
              {t("ABOUT")}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors"
              href="#"
            >
              {"GitHub"}
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-700 dark:text-gray-300 hover:text-theme-primary transition-colors"
              href="/directory"
            >
              {t("DIRECTORY")}
            </Link>
          </NavbarItem>
        </NavbarContent>
        

        <NavbarContent justify="end">
          <NavbarItem>
            <NavigationControls />
          </NavbarItem>
          {providers.length > 0 && (
            <NavbarItem>
              <ProfileButton session={session} />
            </NavbarItem>
          )}
        </NavbarContent>
      </div>
    </Navbar>
  );
}

export const ChevronDown = ({ fill, size, height, width, ...props }: any) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};
