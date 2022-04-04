import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AppSessionState,
  defaultAppSessionState,
} from "../abstractions/app-session";
import { useAppServices } from "./AppServicesContext";

type SimplifiedAppSessionState =
  | { status: "unknown" }
  | { status: "non-authenticated" }
  | {
      status: "authenticated";
      dopplerAccountName: string;
      unlayerUser: { id: string; signature: string };
    };

export const AppSessionStateContext = createContext<SimplifiedAppSessionState>(
  defaultAppSessionState
);

const mapAppSessionStateToSimplifiedAppSessionState: (
  appSessionState: AppSessionState
) => SimplifiedAppSessionState = (appSessionState: AppSessionState) => {
  if (appSessionState.status !== "authenticated") {
    return { status: appSessionState.status };
  }
  const {
    status,
    dopplerAccountName,
    unlayerUser: { id, signature },
  } = appSessionState;
  return {
    status,
    dopplerAccountName,
    unlayerUser: { id, signature },
  };
};

export const AppSessionStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { appSessionStateMonitor } = useAppServices();

  const [appSessionState, setAppSessionState] =
    useState<SimplifiedAppSessionState>(defaultAppSessionState);

  useEffect(() => {
    appSessionStateMonitor.onSessionUpdate = (newValue) =>
      setAppSessionState((prevState) =>
        prevState.status === newValue.status
          ? prevState // When the status does not change, we could assume that the values does not change
          : mapAppSessionStateToSimplifiedAppSessionState(newValue)
      );
  }, [appSessionStateMonitor]);

  return (
    <AppSessionStateContext.Provider value={appSessionState}>
      {children}
    </AppSessionStateContext.Provider>
  );
};

export const useAppSessionState = () => useContext(AppSessionStateContext);
