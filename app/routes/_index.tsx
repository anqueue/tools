import { Button } from "@mantine/core";
import { Link, MetaFunction, redirect } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Homepage" }, { name: "description", content: "Homepage" }];
};

export const loader = async () => {
  return redirect("/calculator");
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
