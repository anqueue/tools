import { MetaFunction, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import Calculator from "./calculator";

export const meta: MetaFunction = () => {
  return [{ title: "Homepage" }, { name: "description", content: "Homepage" }];
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/calculator");
  }, [navigate]);

  return <Calculator />;
}
