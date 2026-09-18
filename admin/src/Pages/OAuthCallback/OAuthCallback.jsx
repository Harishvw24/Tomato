import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user.role !== "admin") {
          navigate("/login");
          return;
        }

        localStorage.setItem("adminToken", token);
        navigate("/orders");
      } catch {
        navigate("/login");
      }
    };

    finishLogin();
  }, [navigate]);

  return <p>Signing you in...</p>;
};

export default OAuthCallback;