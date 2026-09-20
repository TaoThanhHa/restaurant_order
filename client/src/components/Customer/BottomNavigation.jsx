import { Home, ShoppingCart } from "lucide-react";

export default function BottomNav(){

    return(
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
            <div className="mx-auto flex max-w-md justify-around py-3">
                <button className="flex flex-col items-center">
                    <Home/>
                    
                    <span className="text-sm">
                        Trang chủ
                    </span>
                </button>

                <button className="flex flex-col items-center">
                    <ShoppingCart/>

                    <span className="text-sm">
                        Giỏ hàng
                    </span>
                </button>
            </div>
        </div>
    );
}