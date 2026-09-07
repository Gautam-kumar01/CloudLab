import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProductDemo from '@/components/landing/ProductDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import WorkspaceShowcase from '@/components/landing/WorkspaceShowcase';
import AISection from '@/components/landing/AISection';
import GithubSection from '@/components/landing/GithubSection';
import CollaborationSection from '@/components/landing/CollaborationSection';
import DeploymentSection from '@/components/landing/DeploymentSection';
import WhyCloudLab from '@/components/landing/WhyCloudLab';
import Security from '@/components/landing/Security';
import TechStack from '@/components/landing/TechStack';
import Audience from '@/components/landing/Audience';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Navbar />
      <main className="relative">
        <Hero />
        <ProductDemo />
        <HowItWorks />
        <Features />
        <WorkspaceShowcase />
        <AISection />
        <GithubSection />
        <CollaborationSection />
        <DeploymentSection />
        <WhyCloudLab />
        <Security />
        <TechStack />
        <Audience />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
