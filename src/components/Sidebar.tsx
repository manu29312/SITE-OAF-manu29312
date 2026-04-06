type SidebarItem = {
  label: string;
  active?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
};

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="sidebar panel" aria-label="Navigation principale">
      <nav>
        <ul className="sidebar-list">
          {items.map((item) => (
            <li key={item.label}>
              <button className={`sidebar-link ${item.active ? 'active' : ''}`} type="button">
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
