import { Button } from "@mantine/core";
import { Link, MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Homepage" }, { name: "description", content: "Homepage" }];
};

export default function Index() {
  return (
    <div>
      <Button component={Link} to="/calculator">
        Calculator
      </Button>
    </div>
  );
}
