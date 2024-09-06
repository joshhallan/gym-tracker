import React, { useState } from "react";
import { auth} from "../firebase";
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithEmailAndPasswordHandler = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence)
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
      props.setIsAuth(true);
    } catch (error) {
      alert("User not found: Email not registered");
      console.log(error);
    }
  };

  return (
    <div className="row">
      <div className="col s12 m6 offset-m3">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Login</span>
            <div className="row">
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="emailLogin"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="emailLogin">Email</label>
                </div>
              </div>
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="passwordLogin"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="passwordLogin">Password</label>
                </div>
              </div>
            </div>
          </div>
          <div className="card-action">
            <a href="#" onClick={signInWithEmailAndPasswordHandler}>
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
