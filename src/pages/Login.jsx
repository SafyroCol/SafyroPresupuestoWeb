// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, activar2FA } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login: loginContext } = useAuth(); // Renombramos para no chocar con el import `login`
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    codigo2FA: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [isOTPMode, setIsOTPMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const dataToSend = isOTPMode
        ? {
          username: formData.username,
          email: formData.email,
          codigo2FA: formData.codigo2FA,
        }
        : {
          username: formData.username,
          password: formData.password,
          email: formData.username,
        };

      const response = await login(dataToSend);
      loginContext({
        empresaId: response.empresaId,
        empresaNombre: response.empresaNombre,
        expiration: response.expiration,
        roles: Array.isArray(response.roles)
          ? response.roles
          : [response.roles], // <-- esto garantiza que sea array
        token: response.token,
        usuario: response.usuario // si quieres guardar también el nombre
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales incorrectas o código inválido");
    }
  };

  const handleEnviarOTP = async () => {
    try {
      await activar2FA(formData.email);
      setOtpSent(true);
    } catch (err) {
      setError("No se pudo enviar el código OTP");
    }
  };

  const activarModoOTP = () => {
    setIsOTPMode(true);
    setFormData({ username: "", password: "", email: "", codigo2FA: "" });
  };

  const desactivarModoOTP = () => {
    setIsOTPMode(false);
    setOtpSent(false);
    setFormData({ username: "", password: "", email: "", codigo2FA: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {!isOTPMode && (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </>
        )}

        {isOTPMode && (
          <>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <button
                type="button"
                onClick={handleEnviarOTP}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Enviar código OTP
              </button>
            </div>

            {otpSent && (
              <div className="mb-6">
                <label className="block mb-1 text-sm font-medium">
                  Código OTP
                </label>
                <input
                  type="text"
                  name="codigo2FA"
                  value={formData.codigo2FA}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {isOTPMode ? "Validar OTP" : "Ingresar"}
        </button>

        {!isOTPMode ? (
          <p className="mt-4 text-sm text-center">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={activarModoOTP}
            >
              ¿Deseas autenticarte por OTP?
            </button>
          </p>
        ) : (
          <p className="mt-4 text-sm text-center">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={desactivarModoOTP}
            >
              ¿Volver al inicio de sesión normal?
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
