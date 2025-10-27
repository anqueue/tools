import { Container, Tabs, Title } from "@mantine/core";
import { Outlet, useNavigate } from "@remix-run/react";
import { useState } from "react";

const PAGES: {
  title: string;
  path: string;
  icon?: React.ReactNode;
}[] = [
  {
    title: "Home",
    path: "/calculator",
    icon: null,
  },
  {
    title: "Resistor Equivalent",
    path: "/calculator/resistor",
    icon: null,
  },
  {
    title: "Ohm's Law",
    path: "/calculator/ohms",
    icon: null,
  },
];

export default function Calculator() {
  const [activeTab, setActiveTab] = useState(PAGES[0].path);
  const navigate = useNavigate();

  const handleTabChange = (value: string | null) => {
    setActiveTab(value ?? PAGES[0].path);
    navigate(value ?? PAGES[0].path);
  };

  return (
    <Container mt="xl">
      <Title ta="center" order={2} mb="sm">
        Tools
      </Title>
      <Tabs
        variant="pills"
        defaultValue={PAGES[0].path}
        value={activeTab}
        onChange={handleTabChange}
        style={{}}
      >
        <Tabs.List
          style={{
            justifyContent: "center",
          }}
        >
          {PAGES.map((page) => (
            <Tabs.Tab key={page.path} value={page.path}>
              {page.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Container size="xl" p="md" mt="md">
        <Outlet />
      </Container>
    </Container>
  );
}
