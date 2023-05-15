'use client'

interface MenuItemProps {
    onClick: () => void;
    label: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ label, onClick }) => {
  return (
    <div className="px-4 py-3 hover:bg-neutral-100 transition font-semibold" onClick={onClick}>{label}</div>
  )
}
