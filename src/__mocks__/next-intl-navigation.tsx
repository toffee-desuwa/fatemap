import React from "react";

export function createNavigation() {
  return {
    Link: ({
      href,
      children,
      ...props
    }: {
      href: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
    redirect: () => undefined,
    usePathname: () => "/",
    useRouter: () => ({
      push: () => undefined,
      replace: () => undefined,
      back: () => undefined,
    }),
  };
}
