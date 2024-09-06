import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import M from "materialize-css";
import "../components/common/toast.scss";

const Settings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
        }
      }
    };
    fetchUserData();
    M.updateTextFields();
  }, []);

  const handleSaveChanges = async () => {
    // Update user document
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
      });
    }

    // Update password if provided
    if (password) {
      await updatePassword(user, password);
    }

    M.toast({ html: "Information saved", classes: "toast teal" });
  };

  return (
    <div>
      <div className="row">
        <div className="col s12">
          <div className="card">
            <div className="card-content">
              <span className="card-title">Update information</span>
              <div className="row">
                <div className="input-field col s6">
                  <input
                    id="firstName"
                    type="text"
                    className="validate"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <label htmlFor="firstName">First name</label>
                </div>
                <div className="input-field col s6">
                  <input
                    id="lastName"
                    type="text"
                    className="validate"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <label htmlFor="lastName">Last name</label>
                </div>
                <div className="input-field col s6">
                  <input
                    id="password"
                    type="password"
                    className="validate"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password</label>
                </div>
              </div>
            </div>
            <div className="card-action">
              <a href="#" onClick={handleSaveChanges}>
                Save changes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
