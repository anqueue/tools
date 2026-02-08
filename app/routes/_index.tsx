import { MetaFunction, Navigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Electrical Calculator" }, { name: "description", content: "Electrical calculation tools" }];
};

export default function Index() {
  return <Navigate to="/calculator" replace />;
}
