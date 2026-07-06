import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import socket from "../socket/socket";
import { Button } from "@/components/ui/button";
import { useApolloClient } from "@apollo/client";
function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);

  const client = useApolloClient();

 const handleLogout = async () => {
  socket.disconnect();
  await client.clearStore();
  dispatch(logout());
  navigate("/");

};

//  const handleLogout = () => {
//     if (currentUser?.id) {
//       socket.emit("logout", currentUser.id);
//     }
//     socket.disconnect(); // close connection cleanly
//     dispatch(logout());
//     navigate("/");
//   };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
}

export default LogoutButton;