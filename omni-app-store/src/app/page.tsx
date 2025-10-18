"use client";

import { useState } from "react";
import { signUp, signIn, logOut } from "./lib/auth";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    await signUp(email, password);
  };

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <div>
      <h1>Welcome to the App Store</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleLogOut}>Log Out</button>
    </div>
  );
}
