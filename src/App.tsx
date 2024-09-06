import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import M from "materialize-css";
import "./App.scss";
import Routines from "./pages/Routines";
import Settings from "./pages/Settings";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  const logOutHandler = async () => {
    try {
      await signOut(auth);
      window.location.pathname = "/login";
      setIsAuth(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    var elems = document.querySelectorAll(".sidenav");
    // @ts-ignore
    var instances = M.Sidenav.init(elems, { closeOnClick: true });
  }, []);

  return (
    <BrowserRouter>
      <header>
        <nav className="show-on-med-and-down hide-on-large-only">
          <div className="nav-wrapper teal darken-1 center">
            <Link className="sidenav-close brand-logo" to="/">
              Tracker
            </Link>
            <a
              href="#"
              data-target="slide-out"
              className="sidenav-trigger right"
            >
              <i className="material-icons ">menu</i>
            </a>
          </div>
        </nav>

        <ul className="sidenav sidenav-fixed" id="slide-out">
          <li>
            <div className="user-view">
              <div className="background teal darken-1" />
              {!isAuth && (
                <>
                  <span className="white-text email">Welcome!</span>
                  <span className="white-text email">
                    Sign up or log in below!
                  </span>
                </>
              )}
              {isAuth && (
                <>
                  <span className="white-text email">Welcome!</span>
                  <span className="white-text email">
                    {auth.currentUser!.email}
                  </span>
                </>
              )}
            </div>
          </li>

          {!isAuth && (
            <li>
              <Link className="sidenav-close" to={"/login"}>
                Login <i className="material-icons">login</i>
              </Link>
            </li>
          )}
          {!isAuth && (
            <li>
              <Link className="sidenav-close" to={"/signup"}>
                <i className="material-icons">app_registration</i>Sign Up
              </Link>
            </li>
          )}
          {isAuth && (
            <li>
              <Link className="sidenav-close" to={"/"}>
                <i className="material-icons">home</i>Home
              </Link>
            </li>
          )}
          {isAuth && (
            <li>
              <Link className="sidenav-close" to={"/routines"}>
                <i className="material-icons">edit</i>Routines
              </Link>
            </li>
          )}
          {isAuth && (
            <li>
              <Link
                className="sidenav-close"
                to={"/settings"}
              >
                <i className="material-icons">settings</i>Settings
              </Link>
            </li>
          )}

          {isAuth && (
            <>
              <li>
                <div className="divider"></div>
              </li>
              <li>
                <a href="#" onClick={logOutHandler}>
                  <i className="material-icons">logout</i>Logout
                </a>
              </li>
            </>
          )}
        </ul>
      </header>
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<Home isAuth={isAuth} />} />
          <Route path="/signup" element={<SignUp setIsAuth={setIsAuth} />} />
          <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
          <Route path="/routines" element={<Routines isAuth={isAuth} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
