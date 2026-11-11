/**
 * LiveKit Audio Provider
 * Always-on audio component that persists across tab switches
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { toast } from 'react-hot-toast';

const LiveKitContext = createContext(null);

export const useLiveKit = () => {
    const context = useContext(LiveKitContext);
    if (!context) {
        throw new Error('useLiveKit must be used within LiveKitAudioProvider');
    }
    return context;
};

export const LiveKitAudioProvider = ({ children, roomId, token, serverUrl }) => {
    const [room, setRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isMuted, setIsMuted] = useState(true); // Start muted until we know state
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [error, setError] = useState(null);
    const roomRef = useRef(null);

    // Update participants list
    const updateParticipants = useCallback((livekitRoom) => {
        if (!livekitRoom) return;

        const remoteParticipants = livekitRoom.remoteParticipants || livekitRoom.participants;
        const participantList = remoteParticipants
            ? Array.from(remoteParticipants.values()).map((p) => ({
                identity: p.identity,
                name: p.name || p.identity,
                isSpeaking: p.isSpeaking,
                isMuted: !p.isMicrophoneEnabled,
                isLocal: false,
            }))
            : [];

        if (livekitRoom.localParticipant) {
            participantList.unshift({
                identity: livekitRoom.localParticipant.identity,
                name: livekitRoom.localParticipant.name || 'You',
                isSpeaking: livekitRoom.localParticipant.isSpeaking,
                isMuted: !livekitRoom.localParticipant.isMicrophoneEnabled,
                isLocal: true,
            });
        }

        setParticipants(participantList);
    }, []);

    // Sync local track state with our state
    const syncLocalTrackState = useCallback((livekitRoom) => {
        if (!livekitRoom?.localParticipant) return;

        const micEnabled = livekitRoom.localParticipant.isMicrophoneEnabled;
        const camEnabled = livekitRoom.localParticipant.isCameraEnabled;

        setIsMuted(!micEnabled);
        setIsCameraOff(!camEnabled);

        console.log(`🔄 Synced state: mic=${micEnabled ? 'on' : 'off'}, cam=${camEnabled ? 'on' : 'off'}`);
    }, []);

    // Connect to LiveKit room
    const connect = useCallback(async () => {
        if (!token || !serverUrl || isConnecting || isConnected) {
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            const livekitRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
                audioCaptureDefaults: {
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });

            roomRef.current = livekitRoom;

            // Set up event listeners
            livekitRoom
                .on(RoomEvent.Connected, () => {
                    console.log('✅ Connected to LiveKit room');
                    setIsConnected(true);
                    setIsConnecting(false);
                    toast.success('Connected to audio');
                })
                .on(RoomEvent.Disconnected, () => {
                    console.log('❌ Disconnected from LiveKit room');
                    setIsConnected(false);
                    setParticipants([]);
                    setRoom(null);
                    roomRef.current = null;
                })
                .on(RoomEvent.ParticipantConnected, (participant) => {
                    console.log('👤 Participant connected:', participant.identity);
                    updateParticipants(livekitRoom);
                })
                .on(RoomEvent.ParticipantDisconnected, (participant) => {
                    console.log('👋 Participant disconnected:', participant.identity);
                    updateParticipants(livekitRoom);
                })
                .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    // Skip local participant
                    if (participant.identity === livekitRoom.localParticipant?.identity) {
                        console.log('⚠️ Skipping track attachment for local participant');
                        return;
                    }

                    if (track.kind === Track.Kind.Audio) {
                        console.log('🔊 Attaching remote audio track from:', participant.identity);
                        const existingAudio = document.getElementById(`audio-${participant.identity}`);
                        if (existingAudio) existingAudio.remove();

                        const audioElement = track.attach();
                        audioElement.id = `audio-${participant.identity}`;
                        audioElement.autoplay = true;
                        document.body.appendChild(audioElement);
                    }
                })
                .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                    if (track.kind === Track.Kind.Audio) {
                        console.log('🔇 Audio track unsubscribed from:', participant.identity);
                        track.detach().forEach(el => el.remove());
                    }
                })
                .on(RoomEvent.TrackMuted, (publication, participant) => {
                    updateParticipants(livekitRoom);
                    // If it's local participant, sync state
                    if (participant.identity === livekitRoom.localParticipant?.identity) {
                        syncLocalTrackState(livekitRoom);
                    }
                })
                .on(RoomEvent.TrackUnmuted, (publication, participant) => {
                    updateParticipants(livekitRoom);
                    if (participant.identity === livekitRoom.localParticipant?.identity) {
                        syncLocalTrackState(livekitRoom);
                    }
                })
                .on(RoomEvent.LocalTrackPublished, (publication, participant) => {
                    console.log('📤 Local track published:', publication.source);
                    syncLocalTrackState(livekitRoom);
                })
                .on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
                    console.log('📤 Local track unpublished:', publication.source);
                    syncLocalTrackState(livekitRoom);
                })
                .on(RoomEvent.Reconnecting, () => {
                    console.log('🔄 Reconnecting to LiveKit...');
                    toast.loading('Reconnecting...', { id: 'reconnecting' });
                })
                .on(RoomEvent.Reconnected, () => {
                    console.log('✅ Reconnected to LiveKit');
                    toast.dismiss('reconnecting');
                    toast.success('Reconnected to audio');
                    syncLocalTrackState(livekitRoom);
                });

            // Connect to room
            await livekitRoom.connect(serverUrl, token);

            // Enable audio by default
            await livekitRoom.localParticipant.setMicrophoneEnabled(true);
            setIsMuted(false);
            console.log('🎤 Microphone enabled by default');

            setRoom(livekitRoom);
            updateParticipants(livekitRoom);
        } catch (err) {
            console.error('Error connecting to LiveKit:', err);
            setError(err.message);
            setIsConnecting(false);
            toast.error('Failed to connect to audio');
        }
    }, [token, serverUrl, isConnecting, isConnected, updateParticipants, syncLocalTrackState]);

    // Disconnect from room
    const disconnect = useCallback(async () => {
        const currentRoom = roomRef.current;
        if (currentRoom) {
            await currentRoom.disconnect();
            setRoom(null);
            setIsConnected(false);
            setParticipants([]);
            roomRef.current = null;
            console.log('🔌 Disconnected from LiveKit');
        }
    }, []);

    // Toggle mute - directly read and set mic state
    const toggleMute = useCallback(async () => {
        const currentRoom = roomRef.current;
        if (!currentRoom?.localParticipant) {
            console.warn('🎤 Cannot toggle mute: room not ready');
            return;
        }

        try {
            const currentlyEnabled = currentRoom.localParticipant.isMicrophoneEnabled;
            console.log(`🎤 Toggling mic: currently ${currentlyEnabled ? 'enabled' : 'disabled'}`);

            await currentRoom.localParticipant.setMicrophoneEnabled(!currentlyEnabled);

            // Read the new state
            const newState = currentRoom.localParticipant.isMicrophoneEnabled;
            setIsMuted(!newState);

            console.log(`🎤 Microphone now: ${newState ? 'UNMUTED' : 'MUTED'}`);
            toast.success(newState ? 'Microphone unmuted' : 'Microphone muted');
        } catch (err) {
            console.error('Error toggling mute:', err);
            toast.error('Failed to toggle microphone');
        }
    }, []);

    // Toggle camera
    const toggleCamera = useCallback(async () => {
        const currentRoom = roomRef.current;
        if (!currentRoom?.localParticipant) return;

        try {
            const currentlyEnabled = currentRoom.localParticipant.isCameraEnabled;
            await currentRoom.localParticipant.setCameraEnabled(!currentlyEnabled);

            const newState = currentRoom.localParticipant.isCameraEnabled;
            setIsCameraOff(!newState);

            toast.success(newState ? 'Camera turned on' : 'Camera turned off');
            console.log(`📹 Camera ${newState ? 'on' : 'off'}`);
        } catch (err) {
            console.error('Error toggling camera:', err);
            toast.error('Failed to toggle camera');
        }
    }, []);

    // Auto-connect when token/server URL changes
    useEffect(() => {
        if (token && serverUrl && !isConnected && !isConnecting) {
            connect();
        }
    }, [token, serverUrl, isConnected, isConnecting, connect]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            const currentRoom = roomRef.current;
            if (currentRoom) {
                currentRoom.disconnect();
                roomRef.current = null;
            }
        };
    }, []);

    const value = {
        room,
        isConnected,
        isConnecting,
        participants,
        isMuted,
        isCameraOff,
        error,
        connect,
        disconnect,
        toggleMute,
        toggleCamera,
    };

    return <LiveKitContext.Provider value={value}>{children}</LiveKitContext.Provider>;
};

export default LiveKitAudioProvider;
