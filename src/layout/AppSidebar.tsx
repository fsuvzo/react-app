// Sidebar con comentarios explicativos para cada sección clave

import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";

import {
  Network,
  Users,
  Satellite,
  Briefcase,
  Car,
  UserCog,
  CalendarCheck,
  Route,
  MapPin,
  FileCheck2,
  FileText,
  BarChart2,
  Shield,
  CreditCard,
  UserCheck,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";

// ---------------------------------------------------------------------------
// Tipado de ítems de navegación principales y secundarios
// ---------------------------------------------------------------------------

type SubNavItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
};

// ---------------------------------------------------------------------------
// Definición del esquema de navegación principal (menú lateral)
// ---------------------------------------------------------------------------

const navItems: NavItem[] = [
  {
    icon: <GridIcon />, // Dashboard principal
    name: "Dashboard",
    path: "/home",
  },
  {
    icon: <Network />, // Agrupación: clientes + dispositivos
    name: "Gestión Clientes y Dispositivos",
    subItems: [
      { name: "Clientes", path: "/clientes", icon: <Users size={16} /> },
      { name: "Equipo GPS", path: "/equipo-gps", icon: <Satellite size={16} /> },
      { name: "Simcard", path: "/simcard", icon: <CreditCard size={16} /> },
    ],
  },
  {
    icon: <Briefcase />,
    name: "Gestión de Personas y Vehículos",
    subItems: [
      { name: "Propietarios", path: "/propietarios", icon: <Briefcase size={16} /> },
      { name: "Vehículos", path: "/vehiculos", icon: <Car size={16} /> },
      { name: "Conductores", path: "/conductores", icon: <UserCheck size={16} /> },
      { name: "Usuarios (Clientes)", path: "/usuarios-clientes", icon: <UserCog size={16} /> },
    ],
  },
  {
    icon: <Route />,
    name: "Control de Expediciones y Rutas",
    subItems: [
      { name: "Turnos", path: "/turnos", icon: <CalendarCheck size={16} /> },
      { name: "Expediciones", path: "/expediciones", icon: <Route size={16} /> },
      { name: "Destinos", path: "/destinos", icon: <MapPin size={16} /> },
      { name: "Controles", path: "/controles", icon: <FileCheck2 size={16} /> },
    ],
  },
  {
    icon: <BarChart2 />,
    name: "Indicadores y Reportes",
    subItems: [
      { name: "Reportería", path: "/reporteria", icon: <FileText size={16} /> },
      { name: "Kpis", path: "/kpis", icon: <BarChart2 size={16} /> },
    ],
  },
  {
    icon: <Shield />,
    name: "Gestión de Usuarios",
    subItems: [
      { name: "Usuarios SmartOps", path: "/usuarios-smartops", icon: <Shield size={16} /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Componente Sidebar principal
// ---------------------------------------------------------------------------

const AppSidebar: React.FC = () => {
  // Contexto y hooks internos
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // Estado para controlar submenús abiertos
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);

  // Manejo de alto de submenús animados
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Verifica si una ruta está activa
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Al cambiar la ruta, abrimos el submenú correspondiente
  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, idx) => {
      nav.subItems?.forEach((s) => {
        if (isActive(s.path)) {
          setOpenSubmenu({ type: "main", index: idx });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]);

  // Al cambiar el submenú abierto, calculamos la altura de ese submenú
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      const node = subMenuRefs.current[key];
      if (node) {
        setSubMenuHeight((h) => ({ ...h, [key]: node.scrollHeight }));
      }
    }
  }, [openSubmenu]);

  // Renderizado de ítems principales y submenús
  const renderMenuItems = (items: NavItem[]) => (
      <ul className="flex flex-col gap-4">
        {items.map((nav, idx) => (
            <li key={nav.name}>
              {/* Si tiene subitems, se renderiza como botón colapsable */}
              {nav.subItems ? (
                  <button
                      onClick={() =>
                          setOpenSubmenu((p) => (p?.index === idx ? null : { type: "main", index: idx }))
                      }
                      className={`menu-item group ${
                          openSubmenu?.index === idx ? "menu-item-active" : "menu-item-inactive"
                      } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                  >
              <span className={`menu-item-icon-size ${
                  openSubmenu?.index === idx ? "menu-item-icon-active" : "menu-item-icon-inactive"
              }`}>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                    {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                            className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                openSubmenu?.index === idx ? "rotate-180 text-brand-500" : ""
                            }`}
                        />
                    )}
                  </button>
              ) : nav.path && (
                  // Si no tiene subitems, es un ítem con enlace directo
                  <Link
                      to={nav.path}
                      className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                  >
                    <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  </Link>
              )}

              {/* Renderizado del submenú */}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                      ref={(el) => {
                        subMenuRefs.current[`main-${idx}`] = el;
                      }}
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        height: openSubmenu?.index === idx ? `${subMenuHeight[`main-${idx}`]}px` : "0px",
                      }}
                  >
                    <ul className="mt-2 space-y-1 ml-9">
                      {nav.subItems.map((s) => (
                          <li key={s.name}>
                            <Link
                                to={s.path}
                                className={`menu-dropdown-item ${
                                    isActive(s.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                                }`}
                            >
                              {s.icon && <span className="inline-block w-4 h-4 mr-2">{s.icon}</span>}
                              {s.name}
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

  // Render final del componente sidebar
  return (
      <aside
          className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
              isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          onMouseEnter={() => !isExpanded && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo dinámico (completo o ícono) según expansión */}
        <div
            className={`py-8 flex ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
        >
          <Link to="/home">
            {(isExpanded || isHovered || isMobileOpen) ? (
                <>
                  <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={180} height={40} />
                  <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={180} height={40} />
                </>
            ) : (
                <>
                  <img className="dark:hidden" src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
                  <img className="hidden dark:block" src="/images/logo/logo-icon_blanco.svg" alt="Logo" width={32} height={32} />
                </>
            )}
          </Link>
        </div>

        {/* Render principal del menú */}
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                        !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
                </h2>
                {renderMenuItems(navItems)}
              </div>
            </div>
          </nav>
        </div>
      </aside>
  );
};

export default AppSidebar;