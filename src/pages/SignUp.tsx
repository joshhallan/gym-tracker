import { useState } from "react";
import { db, auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, collection } from "firebase/firestore";

const SignUp = (props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State variable to store error message

  const signUpWithEmailAndPassword = async () => {
    setError(""); // Clear any previous error message

    // Validate inputs
    if (!email || !firstName || !lastName || password.length < 6) {
      setError(
        "Please fill out all fields and ensure password is at least 6 characters"
      );
      return; // Exit the function if validation fails
    }

    // Sanitize first and last names
    const sanitizedFirstName = capitalizeWords(firstName);
    const sanitizedLastName = capitalizeWords(lastName);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      let newDocRef = doc(collection(db, "users"));
      await setDoc(newDocRef, {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email,
        id: newDocRef.id,
      });
      M.toast({ html: "Sign up successful", classes: "toast teal" });
      navigate("/");
      props.setIsAuth(true);
    } catch (error) {
      console.log(error);
      setError("Email already in use or other error occurred"); // Handle other errors more generically
    }
  };

  // Helper function to capitalize words
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="row">
      <div className="col s12 m6 offset-m3">
        <div className="card">
          <div className="card-content">
            <span className="card-title">Sign up</span>
            {error && <p className="red-text">{error}</p>}{" "}
            {/* Display error message if any */}
            <div className="row">
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <label htmlFor="firstName">First name</label>
                </div>
              </div>
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <label htmlFor="lastName">Last name</label>
                </div>
              </div>
              <div className="col s12">
                <div className="input-field">
                  <input
                    id="emailSignUp"
                    type="email"
                    required
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
