import HeroSection from "./components/heroSection";
import PopilStoreSection from "./components/popilStoreSection";
import FeaturesSection from "./components/featuresSection";
import FaqSection from "./components/faqSection";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <div className="overflow-y-visible overflow-x-hidden">
        <HeroSection />
        <PopilStoreSection />
        <FeaturesSection />
        <div
          className="bg-cover bg-center"
          style={{ backgroundImage: "url('/background/bottomBG2.png')" }}
        >
          <FaqSection />
          <Footer />
        </div>
      </div>
    </>
  );
}
