import { useMemo, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import FoodCard from "../components/FoodCard";

const categories = ["Tất cả món", "Món khai vị", "Món chính dân dã", "Đặc sản đồng quê", "Tráng miệng & Nước mát"];

const foods = [
  {
    category: "Món chính dân dã",
    name: "Mâm Bê Hấp Gừng Tình",
    price: "95.000đ",
    time: "15 phút",
    badge: "Món đặc trưng",
    description: "Nước dùng thanh vị cùng từng lát thịt bê mềm, thơm gừng và rau sống.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Đặc sản đồng quê",
    name: "Cơm Niêu Lá Chuối",
    price: "145.000đ",
    time: "20 phút",
    badge: "Bestseller",
    description: "Cơm niêu đất cháy giòn cùng món mặn đậm đà, ăn kèm rau quê và nước chấm.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Món khai vị",
    name: "Mẹt Nem Làng Tre",
    price: "115.000đ",
    time: "10 phút",
    description: "Tổng hợp nem cuốn, nem nướng và các món khai vị đặc trưng của Làng Tre.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Món chính dân dã",
    name: "Cá Lóc Nướng Trui",
    price: "165.000đ",
    time: "25 phút",
    description: "Cá lóc nướng thơm, cuốn bánh tráng cùng rau vườn và nước chấm nhà làm.",
    image: "https://images.unsplash.com/photo-1547592180-7f2c2c6f5a09?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Đặc sản đồng quê",
    name: "Gà Tre Nướng Mật Ong",
    price: "185.000đ",
    time: "25 phút",
    description: "Gà ta nướng vàng, da giòn, thịt mềm cùng lớp mật ong thơm nhẹ.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "Tráng miệng & Nước mát",
    name: "Chè Sen Long Nhãn",
    price: "55.000đ",
    time: "5 phút",
    description: "Vị thanh nhẹ của hạt sen và long nhãn, kết thúc bữa ăn thật dịu dàng.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85",
  },
];

export default function MenuSection() {
  const [category, setCategory] = useState("Tất cả món");

  const visibleFoods = useMemo(
    () => category === "Tất cả món" ? foods.slice(0, 3) : foods.filter((food) => food.category === category),
    [category]
  );

  return (
    <section id="menu" className="section menu-section">
      <div className="container">
        <SectionTitle
          eyebrow="MÓN NGON LÀNG TRE"
          title="Thực Đơn Đa Phong Vị"
        />

        <div className="category-tabs">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "is-active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="food-grid">
          {visibleFoods.map((food) => <FoodCard key={food.name} food={food} />)}
        </div>

        <button className="menu-more-btn">
          Xem Toàn Bộ Thực Đơn 80+ Món <BookOpen size={15} />
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}