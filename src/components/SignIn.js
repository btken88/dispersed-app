import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../component-css/sign-in.css";
import Footer from "./Footer";
import Header from "./Header";

const backend = process.env.API_URL;

export default function SignIn() {
  const [toggle, setToggle] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
  const history = useHistory();

  function signUp(e) {
    setErrors([]);
    setAwaitingResponse(true);
    e.preventDefault();
    fetch(`${backend}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    })
      .then((response) => response.json())
      .then((result) => {
        setAwaitingResponse(false);
        if (result.token) {
          localStorage.setItem("token", result.token);
          history.push("/favorites");
        } else {
          setErrors(result.errors);
        }
      })
      .catch(({ errors }) => {
        setErrors(errors);
      });
  }

  function signIn(e) {
    setErrors([]);
    setAwaitingResponse(true);
    e.preventDefault();
    const fetchParams = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    };
    fetch(`${backend}/login`, fetchParams)
      .then((response) => response.json())
      .then((result) => {
        setAwaitingResponse(false);
        if (result.token) {
          localStorage.setItem("token", result.token);
          history.push("/favorites");
        } else {
          setErrors(result.errors);
        }
      })
      .catch((error) => setErrors(error.errors));
  }

  function errorList() {
    return errors.map((error) => {
      const message = error.msg ? error.msg : error;
      return (
        <p className="error-message" id={message}>
          {message}
        </p>
      );
    });
  }

  function toggleForm() {
    setToggle(!toggle);
    setErrors([]);
  }

  return (
    <div className="form-page">
      <Header />
      <div className="form-container" onSubmit={toggle ? signUp : signIn}>
        <h2>{toggle ? "Sign Up" : "Sign In"}</h2>
        <form className="sign-in">
          {toggle ? (
            <>
              <label>Email</label>
              <input
                type="text"
                name="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          ) : null}
          <label>Username</label>
          <input
            type="text"
            name="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            name="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <button onClick={() => toggleForm()}>
            {toggle ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
