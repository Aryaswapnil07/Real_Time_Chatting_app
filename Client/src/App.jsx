import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <div className='bg-[url("https://img.magnific.com/free-vector/abstract-background-design-with-stars-blue_53876-59271.jpg?t=st=1781797148~exp=1781800748~hmac=84a6affe7f3ec8b4a1699d4abfd822da9a5480ea90ec646264d59e1c19c5b7f0&w=1480")] bg-contain'>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
