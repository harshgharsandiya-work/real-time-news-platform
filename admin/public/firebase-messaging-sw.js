// Scripts for firebase and firebase messaging
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js",
);

let messaging = null;
let isInitialized = false;

const initializeFirebase = (firebaseConfig) => {
    if (isInitialized || !firebaseConfig?.projectId) {
        return;
    }

    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
        const notificationTitle =
            payload.notification?.title ||
            payload.data?.title ||
            "New notification";
        const notificationOptions = {
            body: payload.notification?.body || payload.data?.body || "",
            data: {
                url: payload.data?.url || "/",
            },
        };

        self.registration.showNotification(
            notificationTitle,
            notificationOptions,
        );
    });

    isInitialized = true;
};

self.addEventListener("message", (event) => {
    if (event.data?.type === "FIREBASE_CONFIG") {
        initializeFirebase(event.data.config);
    }
});

self.addEventListener("notificationclick", (event) => {
    const targetUrl = event.notification.data?.url || "/";

    event.notification.close();
    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(targetUrl) && "focus" in client) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }

                return undefined;
            }),
    );
});
