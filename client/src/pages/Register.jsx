import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { REGISTER } from "../../graphql/mutations/authMutations";
import { setCredentials } from "../redux/authSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fav_food: "",
  });

  const [formError, setFormError] = useState("");

  const [registerUser, { loading }] = useMutation(REGISTER);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      const { data } = await registerUser({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fav_food: formData.fav_food,
        },
      });

      dispatch(
        setCredentials({
          user: data.register.user,
          token: data.register.token,
        }),
      );

      navigate("/chat");
    } catch (err) {
      setFormError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-white">
            Create Account
          </CardTitle>
          <p className="text-sm text-gray-400">
            Sign up to start using the app
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username (full width) */}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-gray-300 px-1">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johndoe"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Email + Password (row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-300 px-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-300 px-1">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Confirm Password (full width OR you can also split again) */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-gray-300 px-1">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fav_food" className="text-gray-300 px-1">
                Favorite Food
              </Label>

              <Input
                id="fav_food"
                name="fav_food"
                value={formData.fav_food}
                onChange={handleChange}
                required
                placeholder="Any Fav food"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {formError}
              </div>
            )}

            {/* Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;