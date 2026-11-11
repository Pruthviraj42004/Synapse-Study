import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  CreateNewFolder as NewFolderIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Map file extensions to their respective icons
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'go':
    case 'rs':
    case 'php':
    case 'rb':
      return <CodeIcon fontSize="small" />;
    case 'md':
    case 'txt':
    case 'csv':
    case 'json':
      return <DescriptionIcon fontSize="small" />;
    default:
      return <FileIcon fontSize="small" />;
  }
};

const FileExplorer = ({
  files = [],
  currentFile = null,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  
  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };
  
  const handleCreateFile = () => {
    setIsCreatingFile(true);
  };
  
  const handleCreateFileSubmit = (e) => {
    e.preventDefault();
    if (newFileName && onFileCreate) {
      onFileCreate(newFileName);
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };
  
  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };
  
  const handleDelete = () => {
    if (selectedFile && onFileDelete) {
      onFileDelete(selectedFile);
    }
    handleMenuClose();
  };
  
  const handleRename = () => {
    setIsRenaming(true);
    setRenameValue(selectedFile.name);
    handleMenuClose();
  };
  
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (renameValue && selectedFile && onFileRename) {
      onFileRename(selectedFile, renameValue);
      setIsRenaming(false);
      setRenameValue('');
      setSelectedFile(null);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Typography variant="subtitle1">Files</Typography>
        <Tooltip title="Create New File">
          <IconButton size="small" onClick={handleCreateFile}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {isCreatingFile && (
        <Box component="form" onSubmit={handleCreateFileSubmit} sx={{ p: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="File Name"
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="e.g., main.js"
            autoFocus
            onBlur={() => setIsCreatingFile(false)}
          />
        </Box>
      )}
      
      {isRenaming && selectedFile && (
        <Box component="form" onSubmit={handleRenameSubmit} sx={{ p: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Rename File"
            variant="outlined"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            onBlur={() => setIsRenaming(false)}
          />
        </Box>
      )}
      
      <List dense sx={{ flexGrow: 1, overflow: 'auto' }}>
        {files.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No files yet</Typography>
            <Typography variant="caption">
              Click the + button to create a new file
            </Typography>
          </Box>
        ) : (
          files.map((file) => (
            <ListItem 
              key={file.id} 
              disablePadding
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="more" 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, file)}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              }
              sx={{
                bgcolor: currentFile && currentFile.id === file.id ? 'action.selected' : 'transparent'
              }}
            >
              <ListItemButton 
                onClick={() => handleFileClick(file)} 
                dense
                sx={{ py: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getFileIcon(file.name)}
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  primaryTypographyProps={{ noWrap: true }} 
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
      
      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default FileExplorer;