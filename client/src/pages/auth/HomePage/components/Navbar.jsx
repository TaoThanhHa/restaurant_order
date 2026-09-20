import { CircleUserRound, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Giới thiệu", "about"],
  ["Thực đơn", "menu"],
  ["Cơ sở", "branches"],
  ["Đặt bàn", "booking"],
  ["Liên hệ", "footer"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <button className="brand" onClick={() => scrollTo("home")}>
          <span className="brand__logo">LT</span>
          <span>
            <strong>LÀNG TRE</strong>
            <small>THỰC TINH HOA ẨM THỰC VIỆT</small>
          </span>
        </button>

        <nav className={`navbar__links ${open ? "is-open" : ""}`}>
          {links.map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
          <button className="mobile-booking" onClick={() => scrollTo("booking")}>
            Đặt bàn ngay
          </button>
        </nav>

        <div className="navbar__actions">
          <button className="login-btn">
            <CircleUserRound size={15} />
            Đăng nhập / Đăng ký
          </button>
          <button className="primary-btn navbar__book" onClick={() => scrollTo("booking")}>
            Đặt bàn ngay
          </button>
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Mở menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}