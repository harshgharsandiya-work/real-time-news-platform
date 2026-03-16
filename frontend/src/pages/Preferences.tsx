import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Save } from "lucide-react";
import { api, authHeaders } from "../lib/api";

export default function Preferences() {
    const { jwtToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [receivePushNotifications, setReceivePushNotifications] =
        useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [mutedUntil, setMutedUntil] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me", {
                    headers: authHeaders(jwtToken),
                });
                const prefs = res.data.data.user.notificationPreferences;
                if (prefs) {
                    setReceivePushNotifications(prefs.receivePushNotifications);
                    setIsMuted(prefs.isMuted);
                    if (prefs.mutedUntil) {
                        // format datetime-local
                        const date = new Date(prefs.mutedUntil);
                        // slice off the trailing 'Z' and milliseconds to make datetime-local happy: YYYY-MM-DDThh:mm
                        setMutedUntil(date.toISOString().slice(0, 16));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [jwtToken]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = {
                receivePushNotifications,
                isMuted,
            };
            if (isMuted && mutedUntil) {
                payload.mutedUntil = new Date(mutedUntil).toISOString();
            } else {
                payload.mutedUntil = null;
            }

            await api.post("/users/preferences", payload, {
                headers: authHeaders(jwtToken),
            });
            alert("Preferences saved successfully!");
        } catch (err) {
            console.error("Failed to save preferences", err);
            alert("Error saving preferences.");
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return (
            <div className="p-8 text-center text-gray-500">
                Loading preferences...
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Notification Preferences
                </h1>
                <p className="mt-2 text-gray-600">
                    Control how and when you receive notifications.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Push Notifications
                            </h3>
                            <p className="text-sm text-gray-500">
                                Enable or disable all push notifications for
                                your account.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setReceivePushNotifications(
                                    !receivePushNotifications,
                                )
                            }
                            className={`${
                                receivePushNotifications
                                    ? "bg-indigo-600"
                                    : "bg-gray-200"
                            } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                        >
                            <span
                                className={`${
                                    receivePushNotifications
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Mute Notifications
                            </h3>
                            <p className="text-sm text-gray-500">
                                Temporarily pause all notifications.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            className={`${
                                isMuted ? "bg-indigo-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                        >
                            <span
                                className={`${
                                    isMuted ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>

                    {isMuted && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700">
                                Mute Until
                            </label>
                            <input
                                type="datetime-local"
                                value={mutedUntil}
                                onChange={(e) => setMutedUntil(e.target.value)}
                                className="mt-1 block w-full sm:w-1/2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                required={isMuted}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Notifications will automatically resume after
                                this time.
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save Preferences"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
