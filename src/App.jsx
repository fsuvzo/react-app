import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

function App() {
    return (

        <Router>
            <Routes>
                {/* Login sin navbar */}
                <Route path="/login" element={<Login/>}/>

                {/* Rutas que SÍ usan navbar */}
                <Route element={<Layout/>}>
                    {/* Redirigir "/" a login por defecto */}
                    <Route
                        path="/"
                        element={
                            localStorage.getItem("usuario") ? (
                                <Navigate to="/home" replace/>
                            ) : (
                                <Navigate to="/login" replace/>
                            )
                        }
                    />

                    {/* Ruta protegida dentro del layout */}
                    <Route
                        path="/clientes"
                        element={
                            <PrivateRoute>
                                <Clientes/>
                            </PrivateRoute>
                        }
                    />

                    {/* Otras rutas que quieras proteger o no */}
                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                <Home/>
                            </PrivateRoute>
                        }
                    />
                </Route>

                {/* Ruta de error 404 */}
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Router>
    );
}

export default App;
