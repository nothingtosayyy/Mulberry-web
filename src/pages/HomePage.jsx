import Hero from '../components/Hero.jsx'
import FindSkills from '../components/FindSkills.jsx'

/**
 * 首页 = Hero + FindSkills
 */
export default function HomePage() {
  return (
    <main>
      <Hero />
      <FindSkills />
    </main>
  )
}
