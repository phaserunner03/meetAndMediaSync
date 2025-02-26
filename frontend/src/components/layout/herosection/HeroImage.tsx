import HomeBanner from '../../../assets/HomeBanner.webp'

const HeroImage = () => {
  return (
      <div className="relative w-full">
      {/* Fixed Background Image */}
      <div className="fixed w-full h-[70vh] z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HomeBanner})` }}
        >
          <div className="absolute inset-0 top-[70%] bg-gradient-to-b from-white/0 via-white/20 to-white/100" />
        </div>
      </div>

      {/* Spacer to maintain layout height */}
      <div className="h-[70vh]" />
    </div>
  )
}

export default HeroImage