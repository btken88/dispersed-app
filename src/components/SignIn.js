import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../component-css/sign-in.css";
import Footer from "./Footer";
import Header from "./Header";

export default function SignIn() {
  const [toggle, setToggle] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const { signUp: firebaseSignUp, signIn: firebaseSignIn } = useAuth();

  async function handleSignUp(e) {
    e.preventDefault();
    setErrors([]);
    setAwaitingResponse(true);

    // Validate password length
    if (password.length < 8) {
      setErrors(["Password must be at least 8 characters"]);
      setAwaitingResponse(false);
      return;
    }

    try {
      await firebaseSignUp(email, password);
      navigate("/favorites");
    } catch (error) {
      setErrors([error.message || "Failed to create account"]);
    } finally {
      setAwaitingResponse(false);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setErrors([]);
    setAwaitingResponse(true);

    try {
      await firebaseSignIn(email, password);
      navigate("/favorites");
    } catch (error) {
      setErrors([error.message || "Failed to sign in"]);
    } finally {
      setAwaitingResponse(false);
    }
  }

  function errorList() {
    return errors.map((error, index) => (
      <p className="error-message" key={index}>
        {error}
      </p>
    ));
  }

  function toggleForm() {
    setToggle(!toggle);
    setErrors([]);
  }

  return (
    <div className="form-page">
      <Header />
      <div className="form-container">
        <h2>{toggle ? "Sign Up" : "Sign In"}</h2>
        <form className="sign-in" onSubmit={toggle ? handleSignUp : handleSignIn}>
          <label>Email</label>
          <input
            type="email"
            name="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            name="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {errors.length ? errorList() : null}
          <input
            type="submit"
            value={toggle ? "Sign Up" : "Sign In"}
            disabled={awaitingResponse}
          />
        </form>
        <div className="toggler">
          <p>
            {toggle ? "Already have an account?" : "Need to create an account?"}
          </p>
          <button type="button" onClick={() => toggleForm()}>
            {toggle ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
