import { useDisclosure } from '@mantine/hooks';
import { Burger, Drawer} from '@mantine/core';
import * as React from "react"
function SidebarNavigator() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <>
      <Burger size="lg" opened={opened} onClick={toggle} aria-label="Toggle navigation" />
      <Drawer
        opened={opened}
        onClose={close}
        padding="md"
        size="250px"
        withCloseButton={false}
        offset={20}
        overlayProps={{color:"blue"}}
        __size="xl"
      >
        {/* <ScrollArea style={{ height: '100%' }}>
          <NavLink label="Home" onClick={close} />
          <NavLink label="Profile" onClick={close} />
          <NavLink label="Settings" onClick={close} />
          <NavLink label="Logout" onClick={close} />
        </ScrollArea>
         */}
         Drawer without header, press escape or click on overlay to close
      </Drawer>
    </>
  );
}

export default SidebarNavigator;
