"use client";

import {
  LuBook,
  LuBookCheck,
  LuFileQuestion,
  LuHouse,
  LuMenu,
} from "react-icons/lu";
import { redirect, usePathname } from "next/navigation";

import Link from "next/link";
import { Skeleton } from "antd";
import clsx from "clsx";
import { createClient } from "@/util/supabase/client";
import { useHorizontalSwipe } from "@/util/use-horizontal-swipe.hook";
import { useIsMobile } from "@/util/use-media-query.hook";
import { useMenus } from "./use-menus.hook";
import { useNabvarContext } from "./navbar.context";

const icons = {
  home: <LuHouse className="flex-shrink-0" color="#fff" size={24} />,
  book: <LuBook className="flex-shrink-0" color="#fff" size={24} />,
  bookCheck: <LuBookCheck className="flex-shrink-0" color="#fff" size={24} />,
  question: <LuFileQuestion className="flex-shrink-0" color="#fff" size={24} />,
};

export function Navbar() {
  const supabase = createClient();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isNavbarCollapsed, setIsNavbarCollapsed } = useNabvarContext();
  const handlers = useHorizontalSwipe({
    onSwipeLeft: () => setIsNavbarCollapsed(true),
  });
  const { menus, isLoading } = useMenus();

  return (
    <div {...handlers}>
      <div
        className={clsx(
          "absolute w-full h-full transition-all duration-300 ease-in-out z-10 backdrop-blur-sm sm:hidden",
          isNavbarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={() => setIsNavbarCollapsed(true)}
      />
      <div
        className={clsx(
          "absolute h-full w-3/4 bg-indigo-700 shadow-lg transition-all duration-300 ease-in-out z-20 px-6 py-12 flex flex-col sm:static",
          isNavbarCollapsed ? "-left-full sm:w-[72px]" : "left-0 sm:w-80"
        )}
      >
        <div className="flex items-center gap-4 mb-12 text-white">
          <div className="p-2 -m-2 rounded-md transition-colors duration-200 hover:bg-indigo-600">
            <LuMenu
              color="#fff"
              size={24}
              className="cursor-pointer flex-shrink-0"
              onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
            />
          </div>
          <span
            className={clsx(
              "leading-5 font-semibold text-lg transition-opacity duration-200",
              isNavbarCollapsed
                ? "opacity-0 pointer-events-none delay-0"
                : "opacity-1 block delay-200"
            )}
          >
            LOGO
          </span>
        </div>
        <div className="text-white font-semibold">
          {isLoading && (
            <>
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
              <Skeleton.Node
                active
                style={{
                  marginBottom: 16,
                  marginLeft: -8,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                }}
              />
            </>
          )}
          {menus?.map((item) => {
            return (
              <Link
                key={item.link}
                href={item.link}
                className={clsx(
                  "flex items-center gap-4 cursor-pointer p-2 -mx-2 mb-4 rounded-md transition-colors duration-200 hover:bg-indigo-600",
                  new RegExp(item.active_regex).test(pathname) &&
                    "!bg-indigo-800"
                )}
                onClick={() => {
                  if (isMobile) {
                    setIsNavbarCollapsed(true);
                  }
                }}
              >
                {icons[item.icon as keyof typeof icons]}
                <span
                  className={clsx(
                    "leading-5 transition-opacity duration-200",
                    isNavbarCollapsed
                      ? "opacity-0 pointer-events-none delay-0"
                      : "opacity-1 block delay-200"
                  )}
                >
                  {item.description}
                </span>
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => {
            redirect("/perfil");
          }}
        >
          Meu Perfil
        </button>
        <button
          onClick={() => {
            supabase.auth.signOut();
            redirect("/login");
          }}
        >
          logout
        </button>
      </div>
    </div>
  );
}
