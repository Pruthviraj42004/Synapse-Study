import { getSocket } from './socketService';

// Study room programming socket events
export const joinStudyRoomProgramming = (roomId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('join_study_room_programming', { roomId });
  }
};

export const leaveStudyRoomProgramming = (roomId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('leave_study_room_programming', { roomId });
  }
};

export const sendCodeChangeInStudyRoom = (roomId, code, language) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('code_change_study_room', { roomId, code, language });
  }
};

export const executeCodeInStudyRoom = (roomId, code, language) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('execute_code_study_room', { roomId, code, language });
  }
};

export const onStudyRoomCodeChanged = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on('study_room_code_changed', callback);
  }
};

export const offStudyRoomCodeChanged = () => {
  const socket = getSocket();
  if (socket) {
    socket.off('study_room_code_changed');
  }
};

export const onStudyRoomCodeExecuted = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on('study_room_code_executed', callback);
  }
};

export const offStudyRoomCodeExecuted = () => {
  const socket = getSocket();
  if (socket) {
    socket.off('study_room_code_executed');
  }
};

// Export as a service object for easy importing
const studyRoomProgrammingSocketService = {
  joinStudyRoomProgramming,
  leaveStudyRoomProgramming,
  sendCodeChangeInStudyRoom,
  executeCodeInStudyRoom,
  onStudyRoomCodeChanged,
  offStudyRoomCodeChanged,
  onStudyRoomCodeExecuted,
  offStudyRoomCodeExecuted
};

export default studyRoomProgrammingSocketService;