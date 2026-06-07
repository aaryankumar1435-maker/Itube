import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';

export default function WatchParty({ videoId, playerRef }) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [status, setStatus] = useState('');
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;
    socketRef.current = io('/watch-party', { withCredentials: true, transports: ['websocket'] });

    socketRef.current.on('user-joined', ({ username }) => {
      setStatus(`${username} joined`);
      setUsers((u) => [...u, { username }]);
    });
    socketRef.current.on('user-left', ({ username }) => {
      setStatus(`${username} left`);
      setUsers((u) => u.filter((x) => x.username !== username));
    });
    socketRef.current.on('play', ({ currentTime }) => {
      if (!playerRef?.current) return;
      playerRef.current.seekTo(currentTime, 'seconds');
      playerRef.current.getInternalPlayer()?.play?.();
    });
    socketRef.current.on('pause', ({ currentTime }) => {
      playerRef.current?.seekTo(currentTime, 'seconds');
      playerRef.current?.getInternalPlayer()?.pause?.();
    });
    socketRef.current.on('seek', ({ currentTime }) => {
      playerRef.current?.seekTo(currentTime, 'seconds');
    });
    socketRef.current.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, [playerRef]);

  const createRoom = () => {
    if (!user) return setStatus('Sign in to create a room');
    connectSocket();
    socketRef.current.emit('create-room', { videoId, userId: user._id, username: user.username }, ({ roomId, error }) => {
      if (error) return setStatus(error);
      setRoomId(roomId);
      setInRoom(true);
      setUsers([{ username: user.username }]);
      setStatus('Room created! Share the room ID.');
    });
  };

  const joinRoom = () => {
    if (!joinInput.trim()) return;
    if (!user) return setStatus('Sign in to join a room');
    connectSocket();
    socketRef.current.emit('join-room', { roomId: joinInput.toUpperCase(), userId: user._id, username: user.username }, ({ success, error, users: roomUsers }) => {
      if (error) return setStatus(error);
      setRoomId(joinInput.toUpperCase());
      setInRoom(true);
      setUsers(roomUsers || []);
      setStatus('Joined room!');
    });
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave-room', { roomId });
    socketRef.current?.disconnect();
    setInRoom(false);
    setRoomId('');
    setMessages([]);
    setUsers([]);
    setStatus('');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', { roomId, userId: user._id, username: user.username, text: msgInput });
    setMsgInput('');
  };

  const emitPlay = (currentTime) => socketRef.current?.emit('play', { roomId, currentTime });
  const emitPause = (currentTime) => socketRef.current?.emit('pause', { roomId, currentTime });
  const emitSeek = (currentTime) => socketRef.current?.emit('seek', { roomId, currentTime });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
        <span>🎉</span> Watch Party
      </button>
    );
  }

  return (
    <div className="bg-surface-card border border-zinc-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
        <span className="font-semibold text-sm flex items-center gap-2">🎉 Watch Party {inRoom && <span className="text-xs text-green-400 font-mono">#{roomId}</span>}</span>
        <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-lg leading-none">×</button>
      </div>

      <div className="p-4">
        {!inRoom ? (
          <div className="space-y-3">
            <button onClick={createRoom} className="btn-primary w-full text-sm">Create Room</button>
            <div className="flex gap-2">
              <input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="Room ID"
                maxLength={8}
                className="input text-sm font-mono tracking-widest"
              />
              <button onClick={joinRoom} className="btn-ghost text-sm shrink-0">Join</button>
            </div>
            {status && <p className="text-xs text-zinc-400">{status}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {users.map((u, i) => (
                  <span key={i} className="text-xs bg-zinc-700 px-2 py-0.5 rounded-full">{u.username}</span>
                ))}
              </div>
              <button onClick={leaveRoom} className="text-xs text-red-400 hover:text-red-300">Leave</button>
            </div>

            <div className="flex gap-1">
              <button onClick={() => emitPlay(playerRef?.current?.getCurrentTime?.() || 0)} className="btn-ghost text-xs flex-1 py-1.5">▶ Sync Play</button>
              <button onClick={() => emitPause(playerRef?.current?.getCurrentTime?.() || 0)} className="btn-ghost text-xs flex-1 py-1.5">⏸ Sync Pause</button>
            </div>

            <div className="bg-zinc-900 rounded-lg p-2 h-36 overflow-y-auto flex flex-col gap-1">
              {messages.length === 0
                ? <p className="text-zinc-600 text-xs text-center mt-10">No messages yet</p>
                : messages.map((m) => (
                    <div key={m.id} className="text-xs">
                      <span className="text-purple-400 font-medium">{m.username}: </span>
                      <span className="text-zinc-300">{m.text}</span>
                    </div>
                  ))
              }
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Message…"
                className="input text-sm flex-1"
              />
              <button type="submit" className="btn-primary text-sm px-3">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
