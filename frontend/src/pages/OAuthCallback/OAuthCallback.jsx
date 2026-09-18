import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(StoreContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);
    setToken(token);
    navigate("/");
  }, [navigate, setToken]);

  return <p>Signing you in...</p>;
};

export default OAuthCallback;