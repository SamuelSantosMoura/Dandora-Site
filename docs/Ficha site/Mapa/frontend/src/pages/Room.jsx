import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';
import Toolbar from '../components/Toolbar';
import MapCanvas from '../components/MapCanvas';

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const { setSocket, setIsDM, isDM } = useStore();

  useEffect(() => {
    // Check if user is DM from routing state
    if (location.state?.isDM) {
      setIsDM(true);
    }

    // Connect to Socket.io server
    // For local dev, we point to localhost:3001
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join_room', roomId);
    });

    newSocket.on('room_state', (state) => {
      console.log('Received room state', state);
      useStore.getState().setTokens(state.tokens || []);
    });

    newSocket.on('tokens_updated', (tokens) => {
      useStore.getState().setTokens(tokens);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, location.state, setSocket, setIsDM]);

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Just load image to Zustand for now
        useStore.getState().setMapImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToken = () => {
    const newToken = {
      id: Math.random().toString(36).substring(2, 8),
      x: 100,
      y: 100,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    const updatedTokens = [...useStore.getState().tokens, newToken];
    useStore.getState().setTokens(updatedTokens);
    
    // Sync with server
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('update_tokens', { roomId, tokens: updatedTokens });
    }
  };

  return (
    <div className="room-container">
      <Toolbar />
      
      {isDM && (
        <div className="dm-controls">
          <h3 style={{ marginBottom: '10px' }}>DM Panel - Room: {roomId}</h3>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <label className="btn" style={{ cursor: 'pointer', textAlign: 'center', padding: '0.5rem', flex: 1 }}>
              Upload Mapa
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadImage} />
            </label>
            
            <button className="btn" style={{ padding: '0.5rem', flex: 1, margin: 0 }} onClick={handleAddToken}>
              + Token
            </button>
          </div>
        </div>
      )}

      <MapCanvas roomId={roomId} />
    </div>
  );
}
