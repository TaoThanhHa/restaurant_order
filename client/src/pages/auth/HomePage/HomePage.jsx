import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import AboutSection from "./sections/AboutSection";
import BranchSection from "./sections/BranchSection";
import MenuSection from "./sections/MenuSection";
import BookingSection from "./sections/BookingSection";
import Footer from "./components/Footer";

export default function App() {
    return (
        <div className="site">
            <Navbar />
            <main>
                <Hero />
                <AboutSection />
                <BranchSection />
                <MenuSection />
                <BookingSection />
            </main>
            <Footer />
        </div>
    );
}