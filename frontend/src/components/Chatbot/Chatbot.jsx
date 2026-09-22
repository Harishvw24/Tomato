import { useContext, useState } from "react";
import axios from "axios";
import "./Chatbot.css";
import { StoreContext } from "../../Context/StoreContext";
import chatbotImage from "../../assets/chatbot_1.png";

const suggestions = ["Find vegetarian food", "Show food under 500", "Track my latest order"];

const Chatbot = ({ setShowLogin }) => {
  const { url, token, addToCart } = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hi! I can help you find food or check your latest order." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const ask = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: trimmedQuestion }
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${url}/api/chat/message`, { message: trimmedQuestion }, {
        headers: token ? { token } : {}
      });
      const result = response.data;

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: result.reply || result.message,
          foods: result.foods || [],
          requiresLogin: result.requiresLogin
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, sender: "bot", text: "I could not connect right now. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ask(message);
  };

  return (
    <div className="chatbot">
      {isOpen && (
        <section className="chatbot-window" aria-label="Food assistant">
          <div className="chatbot-header">
            <div>
              <strong>Food assistant</strong>
              <span>Here to help you choose</span>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((item) => (
              <div key={item.id} className={`chatbot-message ${item.sender}`}>
                <p>{item.text}</p>
                {item.requiresLogin && (
                  <button type="button" className="chatbot-login" onClick={() => setShowLogin(true)}>Sign in</button>
                )}
                {item.foods?.length > 0 && (
                  <div className="chatbot-food-list">
                    {item.foods.map((food) => (
                      <div className="chatbot-food" key={food._id}>
                        <div>
                          <strong>{food.name}</strong>
                          <span>${food.price}</span>
                        </div>
                        <button type="button" onClick={() => addToCart(food._id)}>Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="chatbot-message bot"><p>Looking through the menu...</p></div>}
          </div>

          <div className="chatbot-suggestions">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the menu..." aria-label="Message food assistant" />
            <button type="submit" disabled={!message.trim() || isLoading}>Send</button>
          </form>
        </section>
      )}
      <button
        type="button"
        className={`chatbot-toggle${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close food assistant" : "Open food assistant"}
      >
        {isOpen ? "Close" : <img src={chatbotImage} alt="" />}
      </button>
    </div>
  );
};

export default Chatbot;