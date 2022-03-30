import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../component-css/sign-in.css";
import Footer from "./Footer";
import Header from "./Header";

// const backend = "https://dispersed-api.herokuapp.com";
const backend = "http://localhost:3001";

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
      .catch((err) => alert(err));
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
      });
  }

  function errorList() {
    return errors.map((error) => {
      return <p className="error-message">{error.msg}</p>;
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
