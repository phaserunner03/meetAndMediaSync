import { Loader2 } from "lucide-react";
const Loader = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[9999]">
            <Loader2 className="animate-spin w-16 h-16 text-white" />
        </div>
    )
}

export default Loader
