import { Link } from "react-router-dom";
import logo from "../../assets/image.png";
const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img src={logo} className="mr-3 h-7 sm:h-9" alt="logo" />
      <span className="self-center text-xl font-bold whitespace-nowrap">
        CloudCapture
      </span>
    </Link>
  );
};

export default Logo;
