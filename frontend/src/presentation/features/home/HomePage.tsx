import { CtaSection } from './sections/CtaSection';
import { FeaturedCoursesSection } from './sections/FeaturedCoursesSection';
import { HeroSection } from './sections/HeroSection';
import { ImpactSection } from './sections/ImpactSection';
import { TestimonialsSection } from '../../components/TestimonialsSection/TestimonialsSection';
import { testimonials } from '../../content/home';

export function HomePage() {
  return (
    <>
      <title>SESI Indústria | Impulsione sua carreira na indústria</title>
      <HeroSection />
      <FeaturedCoursesSection />
      <ImpactSection />
      <TestimonialsSection testimonials={testimonials} tone="brand" />
      <CtaSection />
    </>
  );
}
