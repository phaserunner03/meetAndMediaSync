import AuthNavbar from "../common/AuthNavbar";
import SignupForm from "./SignupForm";

const SignUp: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthNavbar buttonText="Log In" buttonLink="/login" />

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Section */}
        <div className="flex-1 bg-gray-100 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800">Create your free account</h1>
          <p className="text-gray-600 mt-2">
            Meet, capture, and store – all in one place with CloudCapture.
          </p>

          <div className="mt-6 space-y-3 text-gray-700">
            <p>✅ Easy meeting scheduling – Organizers can set up and manage meetings.</p>
            <p>✅ Media capture – Screenshots and recordings saved instantly.</p>
            <p>✅ Cloud storage integration – Files stored in Google Drive & GCP.</p>
            <p>✅ Structured media storage – Media are organized automatically.</p>
          </div>
        </div>

        <SignupForm />
      </div>
    </div>
  );
};

export default SignUp;
