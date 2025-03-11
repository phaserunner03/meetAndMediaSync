import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { TextField, Select, MenuItem, InputLabel, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axiosInstance from "../../../utils/axiosConfig";
import {Button} from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AddUsers = () => {
  const { currentUser } = useAuth();
  interface Role {
    _id: string;
    name: string;
    permissions: string[];
  }
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  interface User {
    _id: string;
    email: string;
    role: Role;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {

    const response = await axiosInstance.get("/api/auth/allRoles");
    setRoles(response.data.roles);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/auth/allUsers");
      setUsers(response.data.users);
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        
        navigate("/unauthorized");
      } else {
        console.error("Error fetching users:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post("/api/auth/addUser", {
        email,
        role: selectedRole,
      });
      console.log(`User added: ${response.data}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error adding user:", error);
    }
    setOpenAddDialog(false);
  };

  const handleEditUserRole = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      
      const response = await axiosInstance.put('/api/auth/editUserRole', {
        userId: selectedUser,
        newRole: selectedRole,
      });

      fetchUsers(); 
    } catch (error) {
      console.error("Error updating user role:", error);
    }
    setOpenEditDialog(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await axiosInstance.delete(`/api/auth/deleteUser/${userToDelete}`);
      console.log(userToDelete);
      console.log(`User deleted: ${response.data}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleCloseDialog = (setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setOpenDialog(false);
    };
  };

  const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!currentUser || currentUser.role.name !== "SuperAdmin") {
    return null; // Do not render if the user is not an admin
  }

  return (
    <div className="pt-12 sm:ml-64 px-4 ">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-4"
      >
        <h1 className="text-2xl font-bold">Users</h1>
        <IconButton color="primary" onClick={() => setOpenAddDialog(true)}>
          <AddIcon />
        </IconButton>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4"
      >
        <TextField
          label="Search by email"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 gap-4"
      >
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="border p-4 flex justify-between items-center rounded-lg shadow-md"
          >
            <div>
              <p className="font-semibold">{user.email}</p>
              <p className="text-sm text-gray-600">{user.role.name}</p>
            </div>
            <div>
              <IconButton color="secondary" onClick={() => { setSelectedUser(user._id); setSelectedRole(user.role._id); setOpenEditDialog(true); }}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => { setUserToDelete(user._id); setOpenDeleteDialog(true); }}>
                <DeleteIcon />
              </IconButton>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog(setOpenAddDialog)}>
        <DialogTitle className="text-center font-bold text-2xl mb-4 ">Add User</DialogTitle>
        <div className="flex justify-center pt-px"> 
        <DialogContent>
          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4 mt-4">
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
              >
                <MenuItem value="" disabled>Select Role</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={handleCloseDialog(setOpenAddDialog)} color="primary">Cancel</Button>
              <Button type="submit" variant="default" color="primary">Add User</Button>
            </DialogActions>
          </form>
        </DialogContent>
        </div>
      </Dialog>

      {/* Edit User Role Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog(setOpenEditDialog)}>
        <DialogTitle>Edit User Role</DialogTitle>
        <div className="flex justify-center pt-px"> 
        <DialogContent>
          <form onSubmit={handleEditUserRole}>
            <FormControl fullWidth className="mb-4">
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
              >
                <MenuItem value="" disabled>Select Role</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={handleCloseDialog(setOpenEditDialog)} color="primary">Cancel</Button>
              <Button type="submit" variant="default" color="secondary">Edit Role</Button>
            </DialogActions>
          </form>
        </DialogContent>
        </div>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog(setOpenDeleteDialog)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this user?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog(setOpenDeleteDialog)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddUsers;
