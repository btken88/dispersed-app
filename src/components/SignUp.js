import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../component-css/sign-in.css";
import Footer from "./Footer";
import Header from "./Header";
import SEO from "./SEO";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState([]);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const navigate = useNavigate();
  const { signUp: firebaseSignUp, updateUserProfile } = useAuth();

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

    // Validate password match
    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      setAwaitingResponse(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(["Please enter a valid email address"]);
      setAwaitingResponse(false);
      return;
    }

    try {
      await firebaseSignUp(email, password);
      
      // Update profile with display name if provided
      if (displayName.trim()) {
        await updateUserProfile({ displayName: displayName.trim() });
      }

      // Redirect to map page
      navigate("/map");
    } catch (error) {
      console.error("Sign up error:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setErrors(["An account with this email already exists"]);
      } else if (error.code === "auth/weak-password") {
        setErrors(["Password is too weak"]);
      } else if (error.code === "auth/invalid-email") {
        setErrors(["Invalid email address"]);
      } else {
        setErrors([error.message || "Failed to create account"]);
      }
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
        title="Sign Up - Dispersed"
        description="Create an account to save your favorite dispersed camping locations, create custom campsites, and leave reviews for other campers."
      />
      <Header />
      <div className="form-container">
        <h2>Create Account</h2>
        <form className="sign-in" onSubmit={handleSignUp}>
          {errors.length > 0 && <div className="errors">{errorList()}</div>}
          
          <label>Display Name (Optional)</label>
          <input
            type="text"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you'll appear to others"
            maxLength="50"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="8"
          />

          <input
            type="submit"
            value={awaitingResponse ? "Creating Account..." : "Sign Up"}
            disabled={awaitingResponse}
          />
        </form>
        <div className="toggler">
          <p>Already have an account?</p>
          <Link to="/login">
            <button type="button">Sign In</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
