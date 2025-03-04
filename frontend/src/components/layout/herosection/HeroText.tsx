import React from 'react'
import { useAuth } from "../../../context/authContext";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { doSignInWithGoogle } from '../../../firebase/auth';

const HeroText = () => {
    const { userLoggedIn } = useAuth();
    return (
        <div>
            {/* Scrolling Content */}
            <div className="relative z-10 bg-white">
                {/* Initial Hero Content */}
                <div className="flex flex-col items-center justify-center text-black text-center px-4 py-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-blue-700">
                        Handle Daily Meeting and Media Sync
                    </h1>
                    <p className="text-lg md:text-xl mt-4">
                    Join community who easily book meetings with the #1 scheduling tool.
                    </p>
                    {!userLoggedIn && (
                        <div className="mt-6 flex gap-4">
                                <button className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 px-6 py-3 rounded-full text-lg font-semibold">
                                    Login 
                                </button>
                        </div>
                    )}
                    {userLoggedIn && (
                        <div className="mt-6 flex gap-4">
                            <Link to='/dashboard/home'>
                                <button className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 px-6 py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2">
                                    <span>Get back to Dashboard</span><FaArrowRight />
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default HeroText