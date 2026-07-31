import Hero from '../components/Hero.jsx'
import FindSkills from '../components/FindSkills.jsx'
import SEO from '../components/SEO.jsx'

/**
 * 首页 = Hero + FindSkills
 */
export default function HomePage() {
  return (
    <main>
      <SEO />
      <Hero />
      <FindSkills />
    </main>
  )
}
