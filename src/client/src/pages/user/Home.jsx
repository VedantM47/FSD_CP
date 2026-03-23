import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Filters from "../components/Filters";
import HackathonGrid from "../components/HackathonGrid";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Filters />
        <HackathonGrid />
      </main>

      <Footer />
    </>
  );
}
