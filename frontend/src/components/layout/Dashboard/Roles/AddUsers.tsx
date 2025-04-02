import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/authContext";
import { TextField, Select, MenuItem, InputLabel, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axiosInstance from "../../../../utils/axiosConfig";
import { Button } from "../../../ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Loader from "../../../common/Loader";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../../constants";


const addUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.string().nonempty("Role is required"),
});


const AddUsers = () => {
  const { currentUser } = useAuth();
  interface Role {
    _id: string;
    name: string;
    permissions: string[];
  }

  const [roles, setRoles] = useState<Role[]>([]);
  interface User {
    _id: string;
    email: string;
    role: Role;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const canAddUser = currentUser?.role.permissions?.includes("addUser");

  useEffect(() => {
    // Fetch roles and users from the backend
    fetchRoles();
    fetchUsers();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      role: "",
    },
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // Fetch roles from the backend
      const response = await axiosInstance.get(API_ENDPOINTS.ROLE.ALL);
    
      setRoles(response.data.data.roles);
      
    } catch (error) {
      setRoles([{ _id: "67cad2fed3dd89f49742abee", name: "NAU", permissions: [] }]);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        }
        else {
          toast.error(error.response?.data?.message || ERROR_MESSAGES.ROLE.FETCH_FAILED);
        }
      } else {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from the backend
      const response = await axiosInstance.get(API_ENDPOINTS.USER.ALL);
      setUsers(response.data.data.users);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        } else {
          toast.error(error.response?.data?.message || ERROR_MESSAGES.USER.FETCH_FAILED);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: { email: string; role: string }) => {
      if (!data.email || !data.role) {
        toast.error("Email and Role are required!");
        return;
      }
  
      setLoading(true);
  
      try {
        await axiosInstance.post(API_ENDPOINTS.USER.ADD, {
          email: data.email.trim(), // Ensure no leading/trailing spaces
          role: data.role,
        });
  
        toast.success(SUCCESS_MESSAGES.USER.CREATE_SUCCESS);
        fetchUsers();
        reset();
  
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Add User Error:", error.response?.data);
          toast.error(error.response?.data?.message || ERROR_MESSAGES.USER.CREATE_FAILED);
        } else {
          toast.error(ERROR_MESSAGES.NETWORK_ERROR);
        }
      } finally {
        setLoading(false);
        setOpenAddDialog(false);
      }
    };


  const handleEditUserRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(API_ENDPOINTS.USER.EDIT_ROLE, {
        userId: selectedUser,
        newRole: selectedRole,
      });
      toast.success(SUCCESS_MESSAGES.USER.EDIT_ROLE_SUCCESS);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        } else {
          toast.error(error.response?.data?.message || ERROR_MESSAGES.USER.EDIT_ROLE_FAILED);
        }
      } else {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
      setOpenEditDialog(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      await axiosInstance.delete(API_ENDPOINTS.USER.DELETE(userToDelete));
      toast.success(SUCCESS_MESSAGES.USER.DELETE_SUCCESS);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        } else {
          toast.error(error.response?.data?.message || ERROR_MESSAGES.USER.DELETE_FAILED);
        }
      } else {
        toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleCloseDialog = (setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setOpenDialog(false);
    };
  };

  const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!currentUser?.role?.permissions?.includes?.("viewUser")) {
    return null;
  }

  return (
    <div className="pt-12 sm:ml-64 px-4 ">
      {loading && (
       <Loader/>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-4"
      >
        <h1 className="text-2xl font-bold">Users</h1>
        <IconButton color="primary" onClick={() => setOpenAddDialog(true)}>
          {canAddUser && (<AddIcon />)}
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


      <Dialog open={openAddDialog} onClose={handleCloseDialog(setOpenAddDialog)}>
        <DialogTitle className="text-center font-bold text-2xl mb-4 ">Add User</DialogTitle>
        <div className="flex justify-center pt-px">
          <DialogContent>
            <form onSubmit={handleSubmit(handleAddUser)} className="flex flex-col gap-4">
              <TextField
                type="email"
                label="Email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                className="mb-4"
              />
              <FormControl fullWidth className="mb-4">
                <InputLabel>Select Role</InputLabel>
                <Select
                  {...register("role")}
                  value={selectedRole || ""} 
                  onChange={(e) => setSelectedRole(e.target.value as string)}
                  error={!!errors.role}
                >
                  <MenuItem value="" disabled>Select Role</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role._id} value={role._id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <p className="text-red-500">{errors.role.message}</p>}
              </FormControl>
              <DialogActions>
                <Button onClick={handleCloseDialog(setOpenAddDialog)} color="primary">Cancel</Button>
                <Button type="submit" variant="default" color="primary">Add User</Button>
              </DialogActions>
            </form>
          </DialogContent>
        </div>
      </Dialog>

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
