import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { LOGIN } from "../../graphql/mutations/authMutations";
import { setCredentials } from "../redux/authSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await login({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });

      dispatch(
        setCredentials({
          user: data.login.user,
          token: data.login.token,
        }),
      );

      localStorage.setItem("user", JSON.stringify(data.login.user));
      localStorage.setItem("token", data.login.token);

      navigate("/chat");
    } catch (error) {
      setError(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-white">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-gray-400">
            Login to continue to your dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-300 py-2 px-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300 py-2 px-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Footer */}
            <p className="text-sm text-center text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;