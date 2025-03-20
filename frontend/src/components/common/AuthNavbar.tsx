import { Link } from "react-router-dom";
import logo from "../../assets/image.png";

interface AuthNavbarProps {
  buttonText: string;
  buttonLink: string;
}

const AuthNavbar: React.FC<AuthNavbarProps> = ({ buttonText, buttonLink }) => {
  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <img src={logo} alt="CloudCapture" className="h-8" />
        <span className="text-xl font-bold text-blue-600">CloudCapture</span>
      </div>
      <Link to={buttonLink}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {buttonText}
        </button>
      </Link>
    </nav>
  );
};

export default AuthNavbar;
