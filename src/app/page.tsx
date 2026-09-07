import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProductDemo from '@/components/landing/ProductDemo';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import WhyCloudLab from '@/components/landing/WhyCloudLab';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <Navbar />
      <main className="relative">
        <Hero />
        <ProductDemo />
        <Features />
        <HowItWorks />
        <WhyCloudLab />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
