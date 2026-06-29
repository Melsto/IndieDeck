"use client";

import React from "react";
import { LikesProvider } from "./likestore";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LikesProvider>{children}</LikesProvider>;
}