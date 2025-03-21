import Navbar from "../components/common/Navbar";
import Hero from "../components/layout/Herosection/Hero";
import PageWrapper from "../components/common/PageWrapper";
import Tabs from "../components/layout/Herosection/Tabs";
import Footer from "../components/layout/Herosection/Footer";

const Home = () => {
  return (
    <>
    <PageWrapper>
      <Navbar />
      <Hero />
      <Tabs/>
      <Footer />
      </PageWrapper>
    </>
  );
};

export default Home;
