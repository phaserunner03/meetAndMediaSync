import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { TextField, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axiosInstance from "../../../utils/axiosConfig";
import {Button} from "../../ui/button";
import permissionsData from "../../../data/permissions.json";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios"

const AddNewRole = () => {
  const { currentUser } = useAuth();
  interface Role {
    _id: string;
    name: string;
    permissions: string[];
  }

  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/roles/allRoles");
      setRoles(response.data.data.roles);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized! Please log in again.");
        } else {
          toast.error(error.response?.data?.message || "Error updating role");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/api/roles/addRole", {
        name: newRoleName,
        permissions: newRolePermissions,
      });
      toast.success("Role added successfully");
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized! Please log in again.");
        } else {
          toast.error(error.response?.data?.message || "Error updating role");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setOpenAddDialog(false);
    }
  };

  const handleEditRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    try {
      await axiosInstance.put(`/api/roles/editRole/${selectedRole._id}`, {
        name: selectedRole.name,
        permissions: newRolePermissions,
      });
      toast.success("Role updated successfully");
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized! Please log in again.");
        } else {
          toast.error(error.response?.data?.message || "Error updating role");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setOpenEditDialog(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/api/roles/deleteRole/${roleToDelete}`);
      toast.success("Role deleted successfully");
      fetchRoles(); // Refresh the roles list
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Unauthorized! Please log in again.");
        } else {
          toast.error(error.response?.data?.message || "Error updating role");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
      setRoleToDelete(null);
    }
  };

  const handlePermissionChange = (permission: string) => {
    setNewRolePermissions((prevPermissions) => {
      const hasPermission = prevPermissions.includes(permission);

      if (permission === "addRole") {
        return hasPermission
          ? prevPermissions.filter((perm) => perm !== "addRole") // Unselect only "addRole"
          : [...prevPermissions, "addRole", "viewRoles"].filter((perm, index, self) => self.indexOf(perm) === index); // Add both, ensuring no duplicates
      }
  
      if (permission === "viewRoles" && hasPermission) {
        return prevPermissions.filter((perm) => perm !== "viewRoles" && perm !== "addRole");
      }
  
      return hasPermission
        ? prevPermissions.filter((perm) => perm !== permission)
        : [...prevPermissions, permission];
    });
  };
  

  const handleCloseDialog = (setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setOpenDialog(false);
    };
  };

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!currentUser || !currentUser.role.permissions.includes("viewRoles")) {
    return null; 
  }

  return (
    <div className="pt-4 sm:ml-64">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-4"
      >
        <h1 className="text-2xl font-bold">Roles</h1>
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
          label="Search by role name"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>
      {loading && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <Loader2 className="animate-spin w-16 h-16 text-white" />
  </div>
)}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 gap-4"
        >
          {filteredRoles.map((role) => (
            <motion.div
              key={role._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="border p-4 flex justify-between items-center rounded-lg shadow-md"
            >
              <div>
                <p className="font-semibold">{role.name}</p>
                <p className="text-sm text-gray-600">{role.permissions.join(", ")}</p>
              </div>
              <div>
                <IconButton color="secondary" onClick={() => { setSelectedRole(role); setNewRolePermissions(role.permissions); setOpenEditDialog(true); }}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => { setRoleToDelete(role._id); setOpenDeleteDialog(true); }}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </motion.div>
          ))}
        </motion.div>
    

      {/* Add Role Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog(setOpenAddDialog)}>
        <DialogTitle>Add Role</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddRole}>
            <TextField
              type="text"
              label="Role Name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              fullWidth
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4">
              {permissionsData.map((permission) => (
                <FormControlLabel
                  key={permission}
                  control={
                    <Checkbox
                      checked={newRolePermissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                    />
                  }
                  label={permission}
                />
              ))}
            </FormControl>
            <DialogActions>
              <Button onClick={handleCloseDialog(setOpenAddDialog)} color="primary">Cancel</Button>
              <Button type="submit" variant="default" color="primary">Add Role</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog(setOpenEditDialog)}>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditRole}>
            <TextField
              type="text"
              label="Role Name"
              value={selectedRole?.name || ""}
              onChange={(e) => setSelectedRole({ ...selectedRole!, name: e.target.value })}
              required
              fullWidth
              className="mb-4"
            />
            <FormControl fullWidth className="mb-4">
              {permissionsData.map((permission) => (
                <FormControlLabel
                  key={permission}
                  control={
                    <Checkbox
                      checked={newRolePermissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                    />
                  }
                  label={permission}
                />
              ))}
            </FormControl>
            <DialogActions>
              <Button onClick={handleCloseDialog(setOpenEditDialog)} color="primary">Cancel</Button>
              <Button type="submit" variant="default" color="secondary">Edit Role</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog(setOpenDeleteDialog)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this role?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog(setOpenDeleteDialog)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteRole} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddNewRole;