import { Button, type ButtonProps } from "antd";
import { useNavigate } from "react-router";

export function LinkButton({ to, ...props }: Omit<ButtonProps, "href" | "onClick"> & { to: string }) {
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      href={to}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        navigate(to);
      }}
    />
  );
}
