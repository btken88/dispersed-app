import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../component-css/sign-in.css";
import Footer from "./Footer";
import Header from "./Header";
import SEO from "./SEO";

export default function SignIn() {
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const { signIn: firebaseSignIn } = useAuth();

  async function handleSignIn(e) {
    e.preventDefault();
    setErrors([]);
    setAwaitingResponse(true);

    try {
      await firebaseSignIn(email, password);
      navigate("/map");
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setErrors(["Invalid email or password"]);
      } else if (error.code === "auth/too-many-requests") {
        setErrors(["Too many failed attempts. Please try again later."]);
      } else {
        setErrors([error.message || "Failed to sign in"]);
      }
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

  return (
    <div className="form-page">
      <SEO 
        title="Sign In - Dispersed"
        description="Sign in to save your favorite dispersed camping locations, create custom campsites, and leave reviews for other campers."
      />
      <Header />
      <div className="form-container">
        <h2>Sign In</h2>
        <form className="sign-in" onSubmit={handleSignIn}>
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
          {errors.length > 0 && <div className="errors">{errorList()}</div>}
          <input
            type="submit"
            value={awaitingResponse ? "Signing In..." : "Sign In"}
            disabled={awaitingResponse}
          />
        </form>
        <div className="toggler">
          <p>Need to create an account?</p>
          <Link to="/signup">
            <button type="button">Sign Up</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
