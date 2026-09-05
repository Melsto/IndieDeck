"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LikesProvider } from "./likestore";

type TransitionLayer = {
  key: string;
  node: React.ReactNode;
  visible: boolean;
  exiting: boolean;
};

function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "root";
  const transitionMs = 240;

  const [layers, setLayers] = useState<TransitionLayer[]>(() => [
    {
      key: pathname,
      node: children,
      visible: true,
      exiting: false,
    },
  ]);

  useEffect(() => {
    setLayers((current) => {
      const activeLayer = current[current.length - 1];

      if (activeLayer?.key === pathname) {
        return current.map((layer) =>
          layer.key === pathname
            ? {
                ...layer,
                node: children,
                visible: true,
                exiting: false,
              }
            : layer
        );
      }

      return [
        ...current.map((layer, index) =>
          index === current.length - 1
            ? {
                ...layer,
                visible: false,
                exiting: true,
              }
            : layer
        ),
        {
          key: pathname,
          node: children,
          visible: false,
          exiting: false,
        },
      ];
    });

    const activateId = window.setTimeout(() => {
      setLayers((current) =>
        current.map((layer) =>
          layer.key === pathname
            ? {
                ...layer,
                visible: true,
              }
            : layer
        )
      );
    }, 16);

    const cleanupId = window.setTimeout(() => {
      setLayers((current) => current.filter((layer) => !layer.exiting || layer.key === pathname));
    }, transitionMs + 24);

    return () => {
      window.clearTimeout(activateId);
      window.clearTimeout(cleanupId);
    };
  }, [children, pathname]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        isolation: "isolate",
      }}
    >
      {layers.map((layer) => (
        <div
          key={layer.key}
          style={{
            position: "absolute",
            inset: 0,
            opacity: layer.visible ? 1 : 0,
            transition: `opacity ${transitionMs}ms ease`,
            willChange: "opacity",
            pointerEvents: layer.visible && !layer.exiting ? "auto" : "none",
          }}
        >
          {layer.node}
        </div>
      ))}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LikesProvider>
      <RouteFade>{children}</RouteFade>
    </LikesProvider>
  );
}