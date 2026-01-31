import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  DocsIcon,
  PlusIcon,
  LockIcon,
  UserIcon,
  DollarLineIcon,
  TaskIcon,
  FolderIcon,
  SettingsIcon,
  ChatIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { userHasPermission, userHasRole } from "../utils/DparcelHelper";
import { BanknotesIcon, LinkIcon, NewspaperIcon, WalletIcon } from "@heroicons/react/24/outline";

type SubNavItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  roles?: string[];
  permissions?: string[];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
  roles?: string[];
  permissions?: string[];
};

// restrict items by roles or permissions
const navItems: NavItem[] = [
  // admin navigation
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["admin"],
  },
  {
    icon: <UserIcon />,
    name: "Role & Permission",
    subItems: [
      { name: "Roles", path: "/roles" },
      { name: "Permissions", path: "/permissions" },
    ],
    roles: ["admin"],
  },
  {
    icon: <DocsIcon />,
    name: "View Request",
    path: "/view/requests",
    roles: ["admin"],
  },
  {
    icon: <DollarLineIcon />,
    name: "Payments",
    path: "/payments",
    roles: ["admin"],
  },
  {
    name: "Wallet",
    icon: <PageIcon />,
    path: "/admin/wallet",
    roles: ["admin"],
  },
  {
    icon: <TaskIcon />,
    name: "Services",
    path: "/services",
    roles: ["admin"],
  },
  {
    icon: <FolderIcon />,
    name: "Shipper Levels",
    path: "/shipper/levels",
    roles: ["admin"],
  },
  {
    icon: <NewspaperIcon />,
    name: "Blog",
    path: "/blogs",
    roles: ["admin"],
  },
  {
    icon: <SettingsIcon />,
    name: "Setting",
    subItems: [
      { name: "Payment Setting", path: "/payment/setting" },
    ],
    roles: ["admin"],
  },
  {
    icon: <LockIcon />,
    name: "Profile",
    path: "/profile",
    roles: ["admin"],
  },

  //shopper navigation
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/shopper/dashboard",
    roles: ["shopper"],
    permissions: ["shopper_dashboard"],
  },
  // {
  //   icon: <BoxIcon />,
  //   name: "Products",
  //   path: "/products",
  //   roles: ["shopper"],
  //   permissions: ["products"],
  // },
  {
    icon: <PlusIcon />,
    name: "Request",
    subItems: [
      { name: "Create Request", path: "/shopper/request" },
      { name: "View Request", path: "/shopper/view/request" },
    ],
    roles: ["shopper"],
    permissions: ["create_request"],
  },
  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/shopper/messages",
    roles: ["shopper"],
    permissions: ["create_request"],
  },
  {
    name: "Payments",
    icon: <PageIcon />,
    path: "/shopper/payment",
    roles: ["shopper"],
    permissions: ["shopper_payment"],
  },

  // shipper navigation
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/shipper/dashboard",
    roles: ["shipper"],
    permissions: ["shipper_dashboard"],
  },
  {
    icon: <UserIcon />,
    name: "Shopper Request",
    subItems: [
      { name: "View Request", path: "/shipper/requests" },
    ],
    roles: ["shipper"],
    permissions: ["view_shopper_request"],
  },
  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/shipper/messages",
    roles: ["shipper"],
    permissions: ["view_shopper_request"],
  },
  {
    icon: <GridIcon />,
    name: "Subscription",
    path: "/shipper/subscription",
    roles: ["shipper"],
    permissions: ["subscription"],
  },
  {
    name: "Payments",
    icon: <BanknotesIcon className="w-4 h-4" />,
    path: "/shipper/payment",
    roles: ["shipper"],
    permissions: ["shipper_payment"],
  },
  {
    name: "Wallet",
    icon: <WalletIcon className="w-4 h-4" />,
    path: "/shipper/wallet",
    roles: ["shipper"],
    permissions: ["shipper_payment"],
  },
  {
    name: "Stripe",
    icon: <LinkIcon className="w-4 h-4" />,
    path: "/shipper/stripe-connect",
    roles: ["shipper"],
    permissions: ["shipper_payment"],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main", index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  //  Filter items before rendering based on roles & permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        // Check roles
        if (item.roles && !item.roles.some((role) => userHasRole(role))) {
          return false;
        }
        // Check permissions
        if (item.permissions && !item.permissions.some((perm) => userHasPermission(perm))) {
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        subItems: item.subItems ? filterSubNavItems(item.subItems) : undefined,
      }));
  };

  // ✅ Filter subItems separately
  const filterSubNavItems = (items: SubNavItem[]): SubNavItem[] => {
    return items.filter((subItem) => {
      if (subItem.roles && !subItem.roles.some((role) => userHasRole(role))) {
        return false;
      }
      if (subItem.permissions && !subItem.permissions.some((perm) => userHasPermission(perm))) {
        return false;
      }
      return true;
    });
  };

  // ✅ Get allowed items
  const allowedNavItems = filterNavItems(navItems);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                }`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path)
                  ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                  : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                  }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems?.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] text-white"
                        : "text-white hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))]"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span className="menu-dropdown-badge">new</span>
                        )}
                        {subItem.pro && (
                          <span className="menu-dropdown-badge">pro</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-2 left-0 h-screen transition-all duration-300 ease-in-out z-50 border-r bg-[linear-gradient(180deg,#003bff_25%,#0061ff_100%)]
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex">
        <Link to="/">
          <img
            src="/images/logo/dparcel-logo.svg"
            alt="Logo"
            width={60}
            height={40}
          />
        </Link>
      </div>
      <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-4 text-xs uppercase text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? (
                  <span>Welcome back</span>
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {/* ✅ Use filtered nav items here */}
              {renderMenuItems(allowedNavItems, "main")}
            </div>
          </div>
        </nav>
      </div>
      <style>{`
  /* Webkit browsers (Chrome, Edge, Safari) */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Firefox */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
  }
`}</style>

    </aside>
  );
};

export default AppSidebar;
