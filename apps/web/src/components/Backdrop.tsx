interface BackdropProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function Backdrop({ isOpen, onClick }: BackdropProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 900,
      }}
      aria-hidden="true"
    />
  );
}
