import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignUp = (props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUpWithEmailAndPassword = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
      props.setIsAuth(true);
    } catch (error) {
      alert("Email Already In Use");
      console.log(error);
    }
  };

  return (
    <div className="row">
      <div className="col s12 m6 offset-m3">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Sign up</span>
            <div className="row">
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="emailSignUp"
                    type="email"
                    required
                    //placeholder="Type Your Email Here..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="emailSignUp">Email</label>
                </div>
              </div>
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="passwordSignup"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="passwordSignup">Password</label>
                </div>
              </div>
              <div className="col s12">
                <p>Password should be at least 6 characters</p>
              </div>
            </div>
          </div>
          <div className="card-action">
            <a href="#" onClick={signUpWithEmailAndPassword}>
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
