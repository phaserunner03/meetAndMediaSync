import React from "react";
import { Link } from "react-router-dom";
import { Video, Camera, Users } from "lucide-react";

const Tabs = () => {
  return (
    <section className="py-8 px-6 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 md:px-10">
      <h2 className="font-bold text-3xl" id="learn-more">
        How It Works?
      </h2>
      <h2 className="text-md text-gray-500">
        Manage Meetings, Capture Screenshots & Control Access with Ease
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-8 text-center md:text-start md:grid-cols-2 lg:grid-cols-3 md:px-24">
        
        <div className="flex flex-col cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start justify-center md:justify-start">
          <Video className="h-8 w-8 text-blue-500" />
          <h2 className="mt-4 text-xl font-bold text-black">Create Meeting</h2>
          <p className="mt-1 text-sm text-gray-600 md:text-justify">
            Easily generate a Google Meet link and share it with your team.
            Schedule and track meetings in one place.
          </p>
        </div>

        
        <div className="flex flex-col cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start justify-center md:justify-start">
          <Camera className="h-8 w-8 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-black">
            Capture & Store Screenshots
          </h2>
          <p className="mt-1 text-sm text-gray-600 md:text-justify">
            Take screenshots during meetings and automatically save them to
            Google Drive. Transfer files from Drive to GCP bucket after one day interval.
          </p>
        </div>

        
        <div className="flex flex-col cursor-pointer p-8 border border-gray-100 rounded-3xl bg-white shadow-xl max-md:shadow-md shadow-gray-600/10 hover:shadow-gray-600/15 transition-shadow duration-300 items-center md:items-start justify-center md:justify-start">
          <Users className="h-8 w-8 text-purple-500" />
          <h2 className="mt-4 text-xl font-bold text-black">
            Role-Based Access
          </h2>
          <p className="mt-1 text-sm text-gray-600 md:text-justify">
            Assign roles to users (Admin, Editor, Viewer). Control who can
            create meetings, upload screenshots, and manage files.
          </p>
        </div>
      </div>

      
      <div className="mt-20 text-center">
        <Link
          to="/dashboard"
          className="inline-block rounded-full bg-primary-700 px-12 py-3 text-sm font-medium text-white transition hover:bg-primary-800 focus:outline-none focus:ring focus:ring-primary-400"
        >
          <div className="flex items-center justify-center">
            <Video className="h-6 w-6 mr-2" />
            Get Started Today
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Tabs;
