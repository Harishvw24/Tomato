import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const addToCart = async (itemId) => {
    let updatedCart;
    if (!cartItems[itemId]) {
      updatedCart = { ...cartItems, [itemId]: 1 };
      setCartItems(updatedCart);
    } else {
      updatedCart = { ...cartItems, [itemId]: cartItems[itemId] + 1 };
      setCartItems(updatedCart);
    }
    
    if (token) {
      // User is logged in - save to server only
      await axios.post(url + "/api/cart/add", { itemId }, {
        headers: {
          token: token
        }
      });
    } else {
      // Guest user - save to localStorage only
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
  }

  const removeFromCart = async (itemId) => {
    const updatedCart = { ...cartItems, [itemId]: cartItems[itemId] - 1 };
    setCartItems(updatedCart);
    
    if (token) {
      // User is logged in - save to server only
      await axios.post(url + "/api/cart/remove", { itemId }, {
        headers: {
          token: token
        }
      });
    } else {
      // Guest user - save to localStorage only
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        // Check if itemInfo exists before accessing price
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  }

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  }

  const loadCartData = useCallback(async (userToken) => {
    if (userToken) {
      const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: userToken } });
      setCartItems(response.data.cartData);
      // Clear localStorage when user logs in
      localStorage.removeItem("cartItems");
    }
  }, [url])

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      
      const savedToken = localStorage.getItem("token");
      
      if (savedToken) {
        // User has a token - load cart from server
        setToken(savedToken);
        await loadCartData(savedToken);
      } else {
        // No token - load guest cart from localStorage
        if (localStorage.getItem("cartItems")) {
          setCartItems(JSON.parse(localStorage.getItem("cartItems")));
        }
      }
    }
    loadData();
  }, [])

  useEffect(() => {
    if (token && token !== "") {
      // Token was set (user signed in)
      (async () => {
        await loadCartData(token);
      })();
    }
  }, [token, loadCartData])

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    setCartItems,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken
  }
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider;