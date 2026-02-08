import { MetaFunction, redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Electrical Calculator" }, { name: "description", content: "Electrical calculation tools" }];
};

export function loader() {
  return redirect("/calculator");
}

export default function Index() {
  return null;
}
