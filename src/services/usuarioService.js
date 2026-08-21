import axios from "axios";
import { API_URL } from "../config/api";

const obtenerEmpleados = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/usuarios/empleados`
        );

        return response.data.empleados;
    } catch (error) {
        console.error(
            "Error al obtener empleados:",
            error.response?.data || error.message
        );

        throw error;
    }
};

const cambiarEstadoEmpleado = async (id, activo) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/usuarios/empleados/${id}/estado`,
            {
                activo: activo
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error al cambiar estado:",
            error.response?.data || error.message
        );

        throw error;
    }
};

const iniciarSesion = async (email, password) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/usuarios/login`,
            {
                email,
                password
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error al iniciar sesión:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export {
    obtenerEmpleados,
    cambiarEstadoEmpleado,
    iniciarSesion
};
