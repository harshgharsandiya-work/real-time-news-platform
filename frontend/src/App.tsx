import { useEffect, useState } from "react";
import "./App.css";
import { messaging } from "./config/firebase";
import { getToken } from "firebase/messaging";

function App() {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        async function getPermissionAndToken() {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                });
                setFcmToken(token);
            } else {
                console.log("User denied notification");
            }
        }

        getPermissionAndToken();
    }, []);

    return (
        <>
            <h1>FCM Push Notification Demo</h1>
            {fcmToken && <p>{fcmToken}</p>}
        </>
    );
}

export default App;
