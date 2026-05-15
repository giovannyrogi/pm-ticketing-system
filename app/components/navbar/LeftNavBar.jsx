import SidebarContent from "./SidebarContent";

const LeftNavBar = ({
  menus,
  activeMenu,
  onMenuClick,
  user,
  onHideLoading,
  onShowLoading,
  setLoadingMessage,
  isLoggedIn,
}) => {
  if (!isLoggedIn) return null;

  return (
    <SidebarContent
      menus={menus}
      activeMenu={activeMenu}
      onMenuClick={onMenuClick}
      user={user}
      onShowLoading={onShowLoading}
      onHideLoading={onHideLoading}
      setLoadingMessage={setLoadingMessage}
    />
  );
};

export default LeftNavBar;
