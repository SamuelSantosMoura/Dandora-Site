import useStore from '../store/useStore';

export default function Toolbar() {
  const { currentTool, setCurrentTool, isDM } = useStore();

  const tools = [
    { id: 'select', icon: '👆', label: 'Selecionar / Mover' },
    { id: 'draw', icon: '✏️', label: 'Desenhar' },
    { id: 'ruler', icon: '📏', label: 'Medir Distância' },
  ];

  if (isDM) {
    tools.push({ id: 'fog', icon: '☁️', label: 'Fog of War' });
  }

  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
