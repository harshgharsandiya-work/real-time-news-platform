import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            setIsLoading(true);
            await login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to log in",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email-address"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300  sm:text-sm sm:leading-6 text-black"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    className="mt-2 block w-full rounded-md border-0 py-2 px-3 shadow-sm ring-1 ring-inset ring-gray-300  sm:text-sm sm:leading-6 text-black"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                                {/* Show Password */}
                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
