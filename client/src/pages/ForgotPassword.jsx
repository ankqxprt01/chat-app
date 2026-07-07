import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FORGOT_PASSWORD } from "../../graphql/mutations/authMutations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@apollo/client";

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
    fav_food: "",
    newPassword: "",
  });

 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const navigate = useNavigate();

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
  setSuccess("");

  try {
    const { data } = await forgotPassword({
      variables: {
        email: formData.email,
        fav_food: formData.fav_food,
        newPassword: formData.newPassword,
      },
    });

    console.log("Forgot password response:", data);

    setSuccess(data.forgotPassword);

    setFormData({
      email: "",
      fav_food: "",
      newPassword: "",
    });

    setTimeout(() => {
      navigate("/");
    }, 3000);

  } catch (err) {
    console.log(err);
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-white">
            Reset Password
          </CardTitle>
          <p className="text-sm text-gray-400">
            Verify your favorite food to reset your password
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
                placeholder="you@example.com"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Favorite Food */}
            <div className="space-y-1">
              <Label htmlFor="fav_food" className="text-gray-300 py-2 px-1">
                Favorite Food
              </Label>
              <Input
                id="fav_food"
                type="text"
                name="fav_food"
                value={formData.fav_food}
                onChange={handleChange}
                required
                placeholder="Pizza"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-gray-300 py-2 px-1">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
            <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
                {success}
                <br />
                Redirecting to login...
            </div>
            )}

            {/* Button */}
           <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
            {loading ? "Resetting..." : "Reset Password"}
            </Button>

            {/* Footer */}
            <p className="text-sm text-center text-gray-400">
              Remember your password?{" "}
              <Link
                to="/"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                Back to Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;