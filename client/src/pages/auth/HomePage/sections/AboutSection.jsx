import { Leaf, Soup, UsersRound } from "lucide-react";
import SectionTitle from "../components/SectionTitle";

const highlights = [
  { icon: Leaf, title: "Tươi Sạch", text: "100% nguyên liệu chọn lọc" },
  { icon: Soup, title: "Chuẩn Vị", text: "Bí truyền vị Việt" },
  { icon: UsersRound, title: "Ấm Cúng", text: "Không gian trọn tình" },
];

export default function AboutSection() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionTitle
          eyebrow="CÂU CHUYỆN THƯƠNG HIỆU"
          title="Giới Thiệu Về Làng Tre"
        />

        <div className="about__grid">
          <div className="about__copy">
            <span className="about__mini-title">Nơi hội tụ những ký ức ngọt ngào của bữa cơm quê nhà</span>
            <p>
              Ra đời từ tình yêu sâu sắc với ẩm thực ba miền, <b>Nhà Hàng Làng Tre</b>
              được xây dựng như một chốn dừng chân thanh bình. Làng Tre tái hiện
              nét làng quê Việt Nam bằng tre, gỗ và những món ăn mang đậm hồn Việt.
            </p>
            <p>
              Chúng tôi tự hào sử dụng nguyên liệu tươi sạch theo mùa, kết hợp
              cùng công thức gia truyền và kỹ thuật chế biến hiện đại để mang đến
              hương vị vừa quen vừa tinh tế.
            </p>
          </div>

          <div className="about__image-wrap">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1100&q=85"
              alt="Không gian nhà hàng Làng Tre"
            />
          </div>
        </div>
      </div>
    </section>
  );
}