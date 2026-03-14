import { useState, useEffect, useMemo } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link, useLocation } from "react-router-dom";
import logoMaewMeeCake from "../assets/pictures/logoMaewMeeCake.png";
import {
  FiBox,
  FiChevronDown,
  FiFileText,
  FiGrid,
  FiMenu,
  FiShoppingCart,
  FiTag,
} from "react-icons/fi";
import { BiCalculator } from "react-icons/bi";
import "./SideBar.css";

function SideBarMenu() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [manualOpenIndex, setManualOpenIndex] = useState(null);

  const handleToggle = () => setShow(!show);
  const isActive = (path) => location.pathname === path;

  const toggleMenu = (index) => {
    setManualOpenIndex((prev) => (prev === index ? -1 : index));
  };

  const ListSideBarMenu = [
    {
      name: "รายงานยอดขาย/การวิเคราะห์ความคิดเห็น",
      icon: <BiCalculator className="icon" />,
      subMenu: [
        { name: "รายงานยอดขาย", link: "/" },
        { name: "ผลการวิเคราะห์ความคิดเห็น", link: "/" },
      ],
    },
    {
      name: "จัดการสินค้า",
      icon: <FiBox className="icon" />,
      subMenu: [
        { name: "รายการสินค้า", link: "/product-manage" },
        { name: "สต็อกสินค้า", link: "/" },
        { name: "ประวัติการสต็อกสินค้า", link: "/" },
      ],
    },
    {
      name: "จัดการสินค้าพรีออเดอร์",
      icon: <FiTag className="icon" />,
      subMenu: [
        { name: "รายการสินค้าพรีออเดอร์", link: "/" },
        { name: "สถานะการผลิตสินค้าพรีออเดอร์", link: "/" },
        { name: "ประวัติการสต็อกสินค้าพรีออเดอร์", link: "/" },
      ],
    },
    {
      name: "จัดการคำสั่งซื้อ",
      icon: <FiShoppingCart className="icon" />,
      subMenu: [
        { name: "คำสั่งซื้อทั้งหมด", link: "/" },
        { name: "การจัดส่งออเดอร์", link: "/" },
        { name: "ประวัติคำสั่งซื้อ", link: "/" },
      ],
    },
    {
      name: "จัดการวัตถุดิบ",
      icon: <FiBox className="icon" />,
      subMenu: [
        { name: "รายการวัตถุดิบ", link: "/ingredient-list" },
        { name: "ฟอร์มรับวัตถุดิบใหม่", link: "/add-ingredient" },
        { name: "ประวัติการรับวัตถุดิบ", link: "/ingredient-receive-history" },
      ],
    },
    {
      name: "จัดการสูตร",
      icon: <FiFileText className="icon" />,
      link: "/manage-recipes",
    },
    {
      name: "จัดการพนักงาน",
      icon: <FiGrid className="icon" />,
      subMenu: [
        { name: "รายชื่อพนักงาน", link: "/employeeManage" },
        { name: "จัดการสิทธิ์พนักงาน", link: "/" },
        { name: "ตารางเวร/กะทำงาน", link: "/" },
      ],
    },
    {
      name: "การออกแบบเว็บไซต์",
      icon: <FiGrid className="icon" />,
      link: "/",
    },
  ];

  const matchedGroupIndex = useMemo(
    () =>
      ListSideBarMenu.findIndex((item) =>
        item.subMenu?.some((sub) => location.pathname === sub.link)
      ),
    [location.pathname]
  );

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuContent = (
    <ul className="menu">
      {ListSideBarMenu.map((item, index) => {
        const isOpen =
          manualOpenIndex === null
            ? matchedGroupIndex === index
            : manualOpenIndex === index;
        const hasSubMenu = Boolean(item.subMenu?.length);
        const isGroupActive = hasSubMenu
          ? item.subMenu.some((sub) => isActive(sub.link))
          : false;
        const isItemActive = item.link ? isActive(item.link) : isGroupActive;

        return (
          <li key={index} className={isItemActive ? "active" : ""}>
            {hasSubMenu ? (
              <>
                <button
                  type="button"
                  className={`menu-parent ${isItemActive ? "active" : ""}`}
                  onClick={() => toggleMenu(index)}
                >
                  {item.icon}
                  {item.name}
                  <FiChevronDown className={`chevron ${isOpen ? "rotate" : ""}`} />
                </button>

                {isOpen && (
                  <ul className="submenu">
                    {item.subMenu.map((sub, i) => (
                      <li key={i}>
                        <Link
                          to={sub.link}
                          className={isActive(sub.link) ? "sub-active" : ""}
                          onClick={() => setShow(false)}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link to={item.link} onClick={() => setShow(false)}>
                {item.icon}
                {item.name}
              </Link>
            )}
          </li>
        );
      })}

    </ul>
  );

  return (
    <>
      {/* ปุ่มเมนู (Mobile) */}
      {isMobile && (
        <Button
          variant="light"
          onClick={handleToggle}
          style={{ fontSize: "22px", border: "none" }}
        >
          <FiMenu />
        </Button>
      )}

      {/* Offcanvas (Mobile) */}
      <Offcanvas show={show} onHide={handleToggle} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <aside className="sidebar">
            <div className="sidebar-top">
              <img src={logoMaewMeeCake} alt="Logo" className="sidebar-logo" />
              {menuContent}
            </div>
          </aside>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <aside className="sidebar">
          <div className="sidebar-top">
            <img src={logoMaewMeeCake} alt="Logo" className="sidebar-logo" />
            {menuContent}
          </div>
        </aside>
      )}
    </>
  );
}

export default SideBarMenu;
