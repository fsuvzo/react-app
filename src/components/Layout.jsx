import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <Navbar />
            <div className="p-6">
                <Outlet />
            </div>
        </>
    );
}
