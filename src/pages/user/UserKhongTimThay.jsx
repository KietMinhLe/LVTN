import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Ghost, Home } from "lucide-react";

const UserKhongTimThay = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white text-center p-6">
            {/* Icon */}
            <div className="bg-white p-6 rounded-full shadow-lg shadow-blue-200/60 mb-6">
                <Ghost className="h-16 w-16 text-blue-400" />
            </div>

            {/* Title */}
            <h1 className="text-6xl font-extrabold text-blue-500 mb-2">
                404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Ôi không! Trang bạn tìm không tồn tại 😢
            </h2>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Có thể đường dẫn bạn nhập sai, hoặc trang này đã bị xóa.
                Hãy quay lại trang chủ để tiếp tục nhé.
            </p>

            {/* Button */}
            <div className="flex gap-3">
                <Button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-300/50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                >
                    <Home className="h-5 w-5" />
                    Quay lại trang trước
                </Button>
                <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                    Về trang chủ
                </Button>
            </div>
        </div>
    );
};

export default UserKhongTimThay;

