import { Button } from "antd";
import { LuCompass } from "react-icons/lu";
import { useNavigate } from "react-router";
import { StatusScreen } from "@/components/errors/StatusScreen";

export function NotFoundPage({ isFullPage = true }: { isFullPage?: boolean }) {
  const navigate = useNavigate();

  return (
    <StatusScreen
      isFullPage={isFullPage}
      icon={<LuCompass />}
      eyebrow="404"
      title="Page not found"
      description="The page you're looking for doesn't exist, or you don't have access to it."
      actions={
        <>
          <Button type="primary" onClick={() => navigate("/")}>
            Go to overview
          </Button>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </>
      }
    />
  );
}

export function InAppNotFoundPage() {
  return <NotFoundPage isFullPage={false} />;
}
