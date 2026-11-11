import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  Image,
  Code,
  AudioFile,
  VideoFile,
  InsertDriveFile,
  CloudUpload,
  Delete,
  Download,
  Close,
  Create,
  Search
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import socketService from '../../services/socketService';

// Helper function to get appropriate icon for file type
const getFileIcon = (fileType) => {
  if (fileType.includes('image')) {
    return <Image />;
  } else if (fileType.includes('pdf')) {
    return <PictureAsPdf />;
  } else if (fileType.includes('text') || fileType.includes('javascript') || fileType.includes('json')) {
    return <Code />;
  } else if (fileType.includes('audio')) {
    return <AudioFile />;
  } else if (fileType.includes('video')) {
    return <VideoFile />;
  } else {
    return <Description />;
  }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileSharing = ({ roomId }) => {
  const { user } = useSelector((state) => state.auth);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFileDialog, setOpenFileDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Handle receiving files through socket
  const handleReceiveFile = useCallback((fileData) => {
    setFiles(prevFiles => [fileData, ...prevFiles]);
    setNotificationMessage(`${fileData.uploadedBy} shared a new file: ${fileData.name}`);
    setShowNotification(true);
  }, []);

  // Handle receiving note through socket
  const handleReceiveNote = useCallback((noteData) => {
    setFiles(prevFiles => [noteData, ...prevFiles]);
    setNotificationMessage(`${noteData.createdBy} shared a new note: ${noteData.name}`);
    setShowNotification(true);
  }, []);

  // Handle file deletion from another user
  const handleFileDeleted = useCallback(({ fileId, fileName, deletedBy }) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    setNotificationMessage(`${deletedBy} deleted the file: ${fileName}`);
    setShowNotification(true);
  }, []);

  // Handle note update from another user
  const handleNoteUpdated = useCallback((updatedNote) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === updatedNote.id ? updatedNote : file
      )
    );
    setNotificationMessage(`${updatedNote.createdBy} updated a note: ${updatedNote.name}`);
    setShowNotification(true);
  }, []);

  // Initialize socket connection for file sharing
  useEffect(() => {
    const socket = socketService.getSocket();

    // Join the room for file sharing updates
    socketService.joinRoom(roomId);

    // Listen for existing files when joining room
    const handleExistingFiles = ({ files: existingFiles }) => {
      console.log('[FileSharing] Received existing files:', existingFiles);
      if (existingFiles && existingFiles.length > 0) {
        setFiles(prevFiles => {
          // Merge existing files with current files, avoiding duplicates
          const newFiles = existingFiles.filter(ef =>
            !prevFiles.some(pf => pf.fileName === ef.fileName && pf.fileUrl === ef.fileUrl)
          );
          return [...prevFiles, ...newFiles];
        });
      }
    };

    // Listen for new files shared in real-time
    const handleNewFile = (fileData) => {
      console.log('[FileSharing] Received new file:', fileData);
      setFiles(prevFiles => {
        // Avoid duplicates
        if (prevFiles.some(f => f.fileName === fileData.fileName && f.fileUrl === fileData.fileUrl)) {
          return prevFiles;
        }
        return [fileData, ...prevFiles];
      });
      setNotificationMessage(`${fileData.sharedBy?.name || 'Someone'} shared: ${fileData.fileName}`);
      setShowNotification(true);
    };

    // Register listeners using socket.on directly for correct event names
    socket?.on('existing_files', handleExistingFiles);
    socket?.on('new_file', handleNewFile);

    // Listen for new notes shared by other users  
    socketService.onNoteShared(handleReceiveNote);

    // Listen for file deletions
    socketService.onFileDeleted(handleFileDeleted);

    // Listen for note updates
    socketService.onNoteUpdated(handleNoteUpdated);

    return () => {
      // Clean up socket listeners
      socket?.off('existing_files');
      socket?.off('new_file');
      socketService.off('note_shared');
      socketService.off('file_deleted');
      socketService.off('note_updated');
      socketService.leaveRoom(roomId);
    };
  }, [roomId, handleReceiveNote, handleFileDeleted, handleNoteUpdated]);

  const handleFileUpload = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      setUploading(true);

      // Simulate upload delay - in a real app, this would be an API call
      setTimeout(() => {
        const newFiles = Array.from(selectedFiles).map((file, index) => {
          const fileData = {
            id: Date.now() + index,
            fileName: file.name,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedBy: user?.name || 'You',
            sharedBy: {
              _id: user?.id,
              name: user?.name || 'You',
              avatar: user?.avatar
            },
            uploadedAt: new Date(),
            sharedAt: new Date(),
            url: '#', // In a real app, this would be the URL to the uploaded file
            fileUrl: '#'
          };

          // Emit file shared event through socket
          socketService.shareFile(roomId, fileData);

          return fileData;
        });

        setFiles([...newFiles, ...files]);
        setUploading(false);
        setNotificationMessage(`Successfully uploaded ${newFiles.length} file(s)`);
        setShowNotification(true);
      }, 1500);
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setOpenFileDialog(true);
  };

  const handleDeleteFile = (fileId) => {
    const fileToDelete = files.find(file => file.id === fileId);
    if (fileToDelete) {
      // Remove file from local state
      setFiles(files.filter(file => file.id !== fileId));

      // Emit file deleted event through socket
      socketService.deleteFile(
        roomId,
        fileId,
        fileToDelete.name
      );

      setNotificationMessage(`"${fileToDelete.name}" deleted`);
      setShowNotification(true);
    }
  };

  const handleCreateNote = () => {
    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setOpenNoteDialog(true);
  };

  const handleEditNote = (note) => {
    setNoteTitle(note.name);
    setNoteContent(note.content);
    setEditingNote(note);
    setOpenNoteDialog(true);
  };

  const handleSaveNote = () => {
    if (editingNote) {
      // Update existing note
      const updatedNote = {
        ...editingNote,
        name: noteTitle,
        content: noteContent,
        lastUpdated: new Date()
      };

      setFiles(files.map(file =>
        file.id === editingNote.id ? updatedNote : file
      ));

      // Emit note updated event through socket
      socketService.updateNote(roomId, updatedNote);

      setNotificationMessage(`Note "${noteTitle}" updated`);
    } else {
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        name: noteTitle,
        type: 'note',
        content: noteContent,
        createdBy: user?.name || 'You',
        createdAt: new Date()
      };

      setFiles([newNote, ...files]);

      // Emit note shared event through socket
      socketService.shareNote(roomId, newNote);

      setNotificationMessage(`Note "${noteTitle}" created and shared`);
    }

    setOpenNoteDialog(false);
    setShowNotification(true);
  };

  const filteredFiles = files.filter(file =>
    (file.fileName || file.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Shared Files
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Create />}
              onClick={handleCreateNote}
              sx={{ mr: 1 }}
            >
              New Note
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          sx={{ mb: 2 }}
          size="small"
        />

        {uploading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2">Uploading files...</Typography>
          </Box>
        )}

        {filteredFiles.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            No files found.
          </Typography>
        ) : (
          <List>
            {filteredFiles.map((file) => (
              <React.Fragment key={file.id}>
                <ListItem
                  button
                  onClick={() => file.type === 'note' ? handleEditNote(file) : handleFileClick(file)}
                >
                  <ListItemIcon>
                    {file.type === 'note' ? <Description /> : getFileIcon(file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.fileName || file.name}
                    secondary={
                      file.type === 'note'
                        ? `Created by ${file.createdBy} on ${format(new Date(file.createdAt), 'MMM d, yyyy')}`
                        : `${file.size ? formatFileSize(file.size) + ' • ' : ''}Uploaded by ${file.sharedBy?.name || file.uploadedBy} on ${format(new Date(file.sharedAt || file.uploadedAt), 'MMM d, yyyy')}`
                    }
                  />
                  <ListItemSecondaryAction>
                    {file.type !== 'note' && (
                      <Tooltip title="Download">
                        <IconButton edge="end" aria-label="download">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* File Preview Dialog */}
      <Dialog
        open={openFileDialog}
        onClose={() => setOpenFileDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedFile && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedFile.name}
                </Typography>
                <IconButton onClick={() => setOpenFileDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {selectedFile.type.includes('image') ? (
                  <Box
                    component="img"
                    src={selectedFile.url || "https://via.placeholder.com/800x600?text=Image+Preview"}
                    alt={selectedFile.name}
                    sx={{ maxWidth: '100%', maxHeight: 500 }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <InsertDriveFile sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {selectedFile.type.includes('pdf')
                        ? 'PDF preview not available in this demo'
                        : 'File preview not available'}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>File Type:</strong> {selectedFile.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Uploaded by:</strong> {selectedFile.uploadedBy}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Upload Date:</strong> {format(new Date(selectedFile.uploadedAt), 'PPpp')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<Download />}>Download</Button>
              <Button
                startIcon={<Delete />}
                color="error"
                onClick={() => {
                  handleDeleteFile(selectedFile.id);
                  setOpenFileDialog(false);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Note Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={() => setOpenNoteDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingNote ? 'Edit Note' : 'New Note'}
            </Typography>
            <IconButton onClick={() => setOpenNoteDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            id="note-title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            id="note-content"
            label="Content"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={!noteTitle.trim()}
          >
            {editingNote ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileSharing;