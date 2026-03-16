import { useEffect } from "react";
import { getToken, isSupported, onMessage } from "firebase/messaging";
import { firebaseWebConfig, messaging } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { api, authHeaders } from "../lib/api";

export default function FCMManager() {
    const { user, jwtToken } = useAuth();

    useEffect(() => {
        if (!user || !jwtToken) return;

        const requestPermissionAndRegister = async () => {
            try {
                if (!(await isSupported()) || !("serviceWorker" in navigator)) {
                    return;
                }

                const serviceWorkerRegistration =
                    await navigator.serviceWorker.register(
                        "/firebase-messaging-sw.js",
                    );
                const readyRegistration = await navigator.serviceWorker.ready;
                readyRegistration.active?.postMessage({
                    type: "FIREBASE_CONFIG",
                    config: firebaseWebConfig,
                });

                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.log("Unable to get permission to notify.");
                    return;
                }

                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration,
                });

                if (!token) {
                    console.log(
                        "No registration token available. Request permission to generate one.",
                    );
                    return;
                }

                await api.post(
                    "/notifications/register",
                    { token, platform: "web" },
                    {
                        headers: authHeaders(jwtToken),
                    },
                );
            } catch (error) {
                console.error(
                    "An error occurred while retrieving token.",
                    error,
                );
            }
        };

        requestPermissionAndRegister();

        // Handle incoming foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Message received in foreground:", payload);

            if (Notification.permission !== "granted") {
                return;
            }

            if (payload.notification) {
                new Notification(
                    payload.notification.title ?? "New notification",
                    {
                        body: payload.notification.body,
                    },
                );
                return;
            }

            if (payload.data?.title) {
                new Notification(payload.data.title, {
                    body: payload.data.body,
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user, jwtToken]);

    return null;
}
