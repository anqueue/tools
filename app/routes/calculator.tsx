import { Container, Tabs, Title } from "@mantine/core";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import GitHubButton from "~/components/GitHubLogo";

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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    PAGES.find((page) => page.path === location.pathname)?.path || PAGES[0].path
  );
  const navigate = useNavigate();

  const handleTabChange = (value: string | null) => {
    setActiveTab(value ?? PAGES[0].path);
    navigate(value ?? PAGES[0].path);
  };

  return (
    <Container mt="xl">
      <div
        style={{
          position: "relative",
          width: "100%",
          marginBottom: "var(--mantine-spacing-sm)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <GitHubButton />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Title order={2} c="var(--mantine-color-gray-4  )">
            Electrical Calculator
          </Title>
        </div>
      </div>
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
