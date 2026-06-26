import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // Generate a simple random room ID
    const newRoomId = Math.random().toString(36).substring(2, 8);
    // Passing state to mark this user as DM
    navigate(`/room/${newRoomId}`, { state: { isDM: true } });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId}`, { state: { isDM: false } });
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>VTT RPG</h1>
        <p>Sua mesa virtual de RPG de mesa</p>
        
        <button className="btn" onClick={handleCreateRoom}>
          Criar Nova Mesa (Mestre)
        </button>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
          <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          <span style={{ padding: '0 1rem' }}>OU</span>
          <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleJoinRoom}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Código da Sala" 
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button type="submit" className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            Entrar como Jogador
          </button>
        </form>
      </div>
    </div>
  );
}
