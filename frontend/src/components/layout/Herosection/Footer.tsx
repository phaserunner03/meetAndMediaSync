import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="backdrop-blur-md w-full">
    <div className="w-full mx-auto text-center max-w-screen-xl p-4 flex max-md:flex-col md:items-center md:justify-between">
      <span className="text-sm text-gray-500 sm:text-center">
        © 2025{" "}
        <span className="hover:text-primary-500 hover:cursor-pointer">
          CloudCapture™
        </span>
        . All Rights Reserved.
      </span>
      <Link to="https://github.com/phaserunner03/meetAndMediaSync" className="me-4 md:me-6">
        <span className="hover:text-primary-500 mt-3 text-sm font-medium text-gray-500 sm:mt-0">
          Made with ❤️ by Searce Inc
        </span>
      </Link>
    </div>
  </footer>
  )
}

export default Footer
